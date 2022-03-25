cls

Import-Module "$PSScriptRoot\variables\Variables.psm1" -force
$variables = Get-Variables

function Build-Docker($imageName, $relativeDockerFolder) {
	write-host "----------------------------"
	write-host "Build-Docker"
	write-host "----------------------------"
	docker build --tag $imageName "$PSScriptRoot"
}

function Run-DockerLocally($localhostPort, $dockerInternallyExposedPort, $imageName) {
	write-host "----------------------------"
	write-host "Run-DockerLocally"
	write-host "----------------------------"
	#docker run -d -p "$localhostPort`:$dockerInternallyExposedPort" $imageName
	docker run --name my_drone2p -p 29588:29588/udp -p 80:80/tcp -p 443:443/tcp -p 43554:43554/udp drone2p
    #Start-Process "http://localhost:$localhostPort"
}

function New-Acr($acrName, $resourceGroup) {
	write-host "----------------------------"
	write-host "New-Acr"
	write-host "----------------------------"
	az acr create --name $acrName --resource-group $resourceGroup --sku Basic --admin-enabled true
}

function Get-AcrCredentials($resourceGroup, $acrName) {
	write-host "----------------------------"
	write-host "Get-AcrCredentials"
	write-host "----------------------------"
	return az acr credential show --resource-group $resourceGroup --name $acrName --query "{username:username, password:passwords[0].value}" | ConvertFrom-JSON
}

function Login-Docker($acrName, $acrCredentials) {
	write-host "----------------------------"
	write-host "Login-Docker"
	write-host "----------------------------"
	$loggedIn = $False
	$retryCount = 0
	
	while ($loggedIn -ne $True) {
		if ($retryCount -ge 10) {
			throw "Could not log in after 10 retries, I'm throwing a tantrum"
		}
		
		docker login "$acrName.azurecr.io" --username $acrCredentials.username --password $acrCredentials.password
		
		if ($LastExitCode -ne 0) {
			Write-Warning "Could not log in. Retry attempt: $retryCount"
			$retryCount++
		} else {
			$loggedIn = $true
		}
	}
}

function Tag-DockerBuild($acrName, $imageName, $imagetag) {
	write-host "----------------------------"
	write-host "Tag-DockerBuild"
	write-host "----------------------------"
	docker tag $imageName "$acrName.azurecr.io/$imageName`:$imagetag"
}

function Push-Docker($acrName, $imageName, $imagetag) {
	write-host "----------------------------"
	write-host "Push-Docker"
	write-host "----------------------------"
	docker push "$acrName.azurecr.io/$imageName`:$imagetag"
}

function Assign-AcrPullRights($managedIdentityPrincipalId, $resourceGroup, $subscriptionId, $acrName) {
	write-host "----------------------------"
	write-host "Assign-AcrPullRights"
	write-host "----------------------------"
	az role assignment create --assignee $managedIdentityPrincipalId --scope "/subscriptions/$subscriptionId/resourceGroups/$resourceGroup/providers/Microsoft.ContainerRegistry/registries/$acrName" --role "AcrPull"
}


Build-Docker $variables.imageName $variables.relativePathToDockerFolderContainingDockerFile
#for debugging purposes
#Run-DockerLocally $variables.localhostPort $variables.dockerInternallyExposedPort $variables.imageName
New-Acr $variables.acrName $variables.resourceGroup
$acrCredentials = Get-AcrCredentials $variables.resourceGroup $variables.acrName
$acrCredentials
Login-Docker $variables.acrName $acrCredentials

Tag-DockerBuild $variables.acrName $variables.imageName $variables.imagetag
Push-Docker $variables.acrName $variables.imageName $variables.imagetag

##-----------------
$subscriptionId = az account show --query id --output tsv
##-----------------

#deze stap is stom: heeft PIM nodig en PIM is stom
Assign-AcrPullRights $managedIdentityPrincipalId $variables.resourceGroup $subscriptionId $variables.acrName

#Deploy-App $variables.webAppName $variables.resourceGroup $variables.acrName $variables.imageName $variables.imagetag

