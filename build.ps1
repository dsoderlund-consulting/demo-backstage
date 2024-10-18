$newversion = '0.1.0'
$repo = 'docker.io/dsoderlund/demo-backstage'
$image = "{0}:{1}" -f $repo, $newversion
echo $image
podman images $image
podman build -t $image .
podman push $image

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