$newversion = '0.2.2'
$repo = 'docker.io/dsoderlund/demo-backstage'
$image = "{0}:{1}" -f $repo, $newversion
echo $image
if(-not $pat) {
    $pat = Read-Host -Prompt "Docker PAT" -MaskInput
}
podman images $image
podman login -u dsoderlund docker.io -p $pat
podman build -t $image .
podman push $image

# if I wasn't using argocd image updater I would switch to this repo and commit the new version number to the version file of the app
<#
push-location ../talos/gitops/apps/rh-appset/mgmt/default/demo/backstage
$f = "./version.yaml"
if(test-path($f))
{
    $c = Get-Content -Path ./version.yaml
    $c[-1] = "        image: $image"
    $c | Out-File $f
    git add $f
    git commit -m "updated backstage to version $newversion"
    git push
}
pop-location
#>

argocd login argocd.mgmt.dsoderlund.consulting --sso --grpc-web --name mgmt
argocd app sync backstage