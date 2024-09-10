#KUBERNETES INTRODUCTION
if single host doesn't enough for your app, you can try to deploy apps on top of container orchestrator.

one of container orchestrator is kubernetes.

lets try to run a pod

```bash
kubectl run nginx --image=nginx:latest --labels="app=nginx-demo"
```
verify running pod
```bash
kuebctl get pod
```

get pod logs
```bash
kubectl get logs -f 
```
https://kubernetes.io/docs/reference/kubectl/generated/kubectl_logs/

get pod information
```bash
kubectl describe pod <your-pod-name>
```

exec pod 
```bash
kubectl exec -it <pod_name> -- /bin/bash
```
we will see deprecated message but its still work
in newer version we need to add -- 
```bash
kubectl exec -it nginx-deployment-77d8468669-6tttl -- /bin/bash
```

expose a pod
```bash
kubectl kubectl create svc clusterip nginx-demo --tcp=80:80
```
the default svc is cluster ip but we can also use another svc type like nodeport or loadbalancer.
```bash
kubectl create svc nodeport nginx-demo --tcp=80:80
```
we can also spesify port which need to use
```bash
kubectl create svc nodeport nginx-demo --tcp=80:80 --node-port=30080
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

# WORKLOAD MANAGEMENT
## DEPLOYMENT
https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
deployment can manage pod
```bash
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
```
get deployment
```bash
kubectl get deployment
```
change deployment image
```bash
kubectl set image deployment.v1.apps/nginx-deployment nginx=nginx:1.16.1
```
see update progress 
```bash
kubectl rollout status deployment/nginx-deployment
```
edit deployment 
```bash
kubectl edit deployment/nginx-deployment
```
get replicaset 
```bash
kubectl get rs
```

### what will happen if we do some mistake and cause error?

```bash
kubectl set image deployment/nginx-deployment nginx=nginx:1.161
```
lets verify replica 
```bash
kubectl get rs
```
see pods 
```bash
kubectl get pods
```

see rolluout history
```bash
kubectl rollout history deployment/nginx-deployment
```

see rollout history 
```bash
kubectl rollout history deployment/nginx-deployment --revision=2
```

rollback deployment
```bash
kubectl rollout undo deployment/nginx-deployment
```

rollback deployment to spesific revision
```bash
kubectl rollout undo deployment/nginx-deployment --to-revision=2
```

scale up 
```bash
kubectl scale deployment/nginx-deployment --replicas=4
```

scale down
```bash
kubectl scale deployment/nginx-deployment --replicas=1
```

how to add service to deployment?
you need to match selector behind service & deployment
```bash
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - name: http
    protocol: TCP
    port: 80
    targetPort: 80

```

we can also merge many resource in 1 file, 
```bash
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
        resources:
          limits:
            memory: 200Mi
          requests:
            cpu: 100m
            memory: 200Mi
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - name: http
    protocol: TCP
    port: 80
    targetPort: 80
```

cleanup cluster
```bash
kubectl delete all --all
```

# Daemonset
this resource can be use when you need to deploy app across available node
```bash
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: nginx-DaemonSet
  labels:
    app: nginx
spec:
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
        resources:
          limits:
            memory: 200Mi
          requests:
            cpu: 100m
            memory: 200Mi
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - name: http
    protocol: TCP
    port: 80
    targetPort: 80

```
# Statefullset
## How about statefull apps on kubernetes?
where we can store data ?

we can use statefullset workload management

