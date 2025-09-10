load('ext://git_resource', 'git_checkout')
load('ext://deployment', 'deployment_create')
load('ext://configmap', 'configmap_create')
load('ext://secret', 'secret_yaml_generic')
load('ext://helm_remote', 'helm_remote')

# Deploy ds-ref-platform
#git_checkout('https://github.com/quadmanswe/ds-ref-platform.git#main', './ds-ref-platform')
local(['pwsh', '-WorkingDirectory', 'ds-ref-platform', '-Command', 'Invoke-Build -task bootstrap -username ds -password lelle -email ds@dsoderlund.consulting'])

include('/ds-ref-platform/2_platform/Tiltfile')

# Database
k8s_yaml('cnpg/postgres-cluster.yaml')
k8s_resource(
  resource_deps=['cnpg-controller-manager'],
  new_name='database',
  labels='backstage',
  objects=['backstage-postgres-cluster'],
  extra_pod_selectors=[{'cnpg.io/cluster': 'backstage-postgres-cluster'}],
  port_forwards=5432)

# Redis
helm_remote('redis',release_name='backstage-redis',namespace='default',repo_url='https://charts.bitnami.com/bitnami',
  values='backstage-redis.values.yaml'
)
k8s_resource(
  labels='backstage',
  workload='backstage-redis-master',
)

# Backstage

k8s_yaml(secret_yaml_generic(
  'backstage-secret',
  namespace='default',
  from_env_file=".env.tilt",
))

k8s_yaml(secret_yaml_generic(
  'github-app-backstage-dsoderlund-credentials',
  namespace='default',
  from_file="github-app-backstage-dsoderlund-credentials.yaml",
))

configmap_create(
  'backstage-config',
  from_file=["app-config.production.yaml=app-config.production.yaml,ds-ref-platform-catalog-item.yaml=ds-ref-platform-catalog-item.local.yaml"]
)
docker_build('demo-backstage','.')
k8s_yaml('backstage-dp.yaml')
k8s_resource(
  workload='backstage-deployment',
  labels='backstage',
  port_forwards=7007,
  resource_deps=['database']
)

