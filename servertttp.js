//Heroku variables
const WORKERS = process.env.WEB_CONCURRENCY || 1
const host = '0.0.0.0';
const port = process.env.PORT || 29588;
// Using throng for easy use of the Node.js CLuster API
const throng = require('throng')

//TTTP variables
const PAYLOAD_SIZE = 500;
const MAX_IN_FLIGHT = 16;
const dgram = require('dgram');
const BufferBuilder = require('buffer-builder');
const BufferReader = require('buffer-reader');
const fs = require('fs');
const socket = dgram.createSocket('udp4');
const protoName = Buffer.from("DRONE2P");

throng({
  workers: WORKERS,
  lifetime: Infinity
}, start)

function start() {

	socket.on('error', (err) => {
		console.log(`socket error:\n${err.stack}`);
	});

	socket.on('message', (buf, rinfo) => {
		console.log("incoming", buf);
		//console.log(`socket got: ${buf} from ${rinfo.address}:${rinfo.port}`);
		var br = new BufferReader(buf);

		if (!br.nextBuffer(protoName.length).equals(protoName)) {
			console.log(protoName);
			console.log(protoName.length);
			console.log("*******");
			console.log(br.toString('utf-8'));
			console.error("invalid packet received", buf, rinfo);
			return;
		}
		
		const type = br.nextUInt8();
		const transferId = br.nextUInt32BE();
		
		if (type===0) { // Request
			const file = br.nextAll().toString();
			new Request(rinfo, transferId, file);
			return;
		}

		if (type===1) { // ResponseAck
			var req = requests[transferId];
			if (req) {
				req.ack(br.nextUInt32BE());
			}
			else {
				console.warn("ack for non-existent transfer", transferId);
			}
			return;
		}
		console.error("invalid packet type received", type, buf, rinfo);
		
	});

	console.log(`Try to listen on ${ port }`);
	socket.bind({port: port, exclusive: false})
	console.log(`DRONE2P worker app listening on port ${ port }!`);


	const requests = {};

	function Request(rinfo, transferId, file) {
		if (file=='media3.zip' || file=='media4.zip') {
			// unreliable mode
			if (Math.random()>0.4) return; // drop 60% of initial packets
			this.unreliable = true;
		}
		if (requests[transferId]) {
			// transfer is still in progress, no need to restart
			this.resetProgressTimeout();
			return;
		}
		requests[transferId] = this;
		this.transferId = transferId;
		this.file = file;
		this.rinfo = rinfo
		if (!file.match(/^[a-zA-Z0-9_.]*$/)) file = "";
		fs.readFile("public/"+file, (err,data) => {
			if (err) {
				console.warn("no such file: "+this.file);
				data = Buffer.alloc(0);
			}
			this.data = data;
			this.acked = [];
			this.packets = Math.ceil((data.length+1) / PAYLOAD_SIZE);
			this.send();
			this.resetProgressTimeout();
		});
	}

	Request.prototype.ack = function(seq) {
		if (this.unreliable && Math.random()<0.1) return;
		console.log("ack", this.transferId, seq);
		this.acked[seq] = true;
		for (var i = 0; i < this.packets; i++) {
			if (this.acked[i] !== true) {
				// transfer not done yet
				this.send();
				this.resetProgressTimeout();
				return;
			}
		}
		// transfer complete!
		this.close();
	};

	Request.prototype.resetProgressTimeout = function() {
		clearTimeout(this.progressTimeout);
		this.progressTimeout = setTimeout(() => {
			this.close();
			console.warn("aborting due to ack timeout", this.transferId);
		}, 20000);
	};

	Request.prototype.close = function() {
		delete this.data;
		delete this.acked;
		delete requests[this.transferId];
		clearTimeout(this.progressTimeout);
	};

	Request.prototype.send = function() {
		var inFlight = 0;
		for(var seq = 0; inFlight < MAX_IN_FLIGHT && seq < this.packets; seq++) {
			var ack = this.acked[seq];
			if (ack!==true) {
				inFlight++;
				if (ack!==false) {
					this.sendFrame(seq);
				}
			}
		}
	};

	Request.prototype.sendFrame = function(seq) {
		if (!this.acked || this.acked[seq]===true) return; // already aborted or acked
		this.acked[seq] = false;

		var bb = new BufferBuilder();
		bb.appendBuffer(protoName);
		bb.appendUInt8(128); // packet type ResponseData
		bb.appendUInt32BE(this.transferId);
		bb.appendUInt32BE(seq);
		bb.appendBuffer(this.data.slice(seq * PAYLOAD_SIZE, (seq+1) * PAYLOAD_SIZE));

		if (!this.unreliable || Math.random()>0.1) {
			socket.send(bb.get(), this.rinfo.port, this.rinfo.address);
		}

		setTimeout(() => { // retry in 3s
			this.sendFrame(seq);
		}, 2000);
	};

} //end start()


