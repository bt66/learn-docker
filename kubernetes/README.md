if single host doesn't enough for your app, you can try to deploy apps on top of container orchestrator.

one of container orchestrator is kubernetes.

lets try to run a pod

```bash
kubectl run nginx --image=nginx:latest --labels="app=nginx-demo"
```
verify running container
```bash
kuebctl get pod
```

expose a pod
```bash
kubectl kubectl create svc clusterip nginx-demo --tcp=80:80
```

verify svc 
```bash
kubectl port-forward service/nginx-demo 8088:80
```

delete resource
```bash
kubectl delete svc nginx-demo
kubectl delete pod nginx
```


