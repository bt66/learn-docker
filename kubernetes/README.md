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
kubectl logs -f 
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
  type: NodePort
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

```bash
apiVersion: v1
kind: Service
metadata:
  name: mysql
  labels:
    app: mysql
spec:
  ports:
    - port: 3306
      name: mysql
  clusterIP: None  # Headless service
  selector:
    app: mysql

---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  serviceName: "mysql"
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
        - name: mysql
          image: mysql:8.0
          ports:
            - containerPort: 3306
              name: mysql
          env:
            - name: MYSQL_ROOT_PASSWORD
              value: "my-secret-pw"  # Set your root password here
          volumeMounts:
            - name: mysql-persistent-storage
              mountPath: /var/lib/mysql
  volumeClaimTemplates:
  - metadata:
      name: mysql-persistent-storage
    spec:
      accessModes: [ "ReadWriteOnce" ] # https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes
      resources:
        requests:
          storage: 1Gi
```

list persistant volume
```bash
kubectl get pv
```

list persistant volume claim
```bash
kubectl get pvc
```

cleanup
```bash
kubectl delete all --all
kubectl delete pvc <pvc-id>
kubectl delete pv <pvc-id>
```

# Kubernetes allow you to auto scale based on load, this feature named Horizontal Pod Auto Scaler (HPA)

we gonna try nginx autoscale including load test to ensure auto scale is work.
first we crate nginx deployment
```bash
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 1
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
          image: nginx
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "200m"
              memory: "256Mi"
          ports:
            - containerPort: 80
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
---
apiVersion: autoscaling/v1
kind: HorizontalPodAutoscaler
metadata:
  name: nginx-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx-deployment
  minReplicas: 1
  maxReplicas: 3
  targetCPUUtilizationPercentage: 50
```


run pod for testing
```bash
kubectl run -i --tty load-generator --image=busybox /bin/sh
```

execute curl command with infinity loop 
```bash
while true; do wget -q -O- http://nginx-hpa-service; done
```
check hpa

```bash
kubectl get hpa
```

it will show 
<unknown> / 50%
because metric server isn't installed

by default kubernetes from docker desktop doesnt include metric server plugin, so we should install it
```
apiVersion: v1
kind: ServiceAccount
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    k8s-app: metrics-server
    rbac.authorization.k8s.io/aggregate-to-admin: "true"
    rbac.authorization.k8s.io/aggregate-to-edit: "true"
    rbac.authorization.k8s.io/aggregate-to-view: "true"
  name: system:aggregated-metrics-reader
rules:
- apiGroups:
  - metrics.k8s.io
  resources:
  - pods
  - nodes
  verbs:
  - get
  - list
  - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    k8s-app: metrics-server
  name: system:metrics-server
rules:
- apiGroups:
  - ""
  resources:
  - nodes/metrics
  verbs:
  - get
- apiGroups:
  - ""
  resources:
  - pods
  - nodes
  verbs:
  - get
  - list
  - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server-auth-reader
  namespace: kube-system
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: extension-apiserver-authentication-reader
subjects:
- kind: ServiceAccount
  name: metrics-server
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server:system:auth-delegator
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:auth-delegator
subjects:
- kind: ServiceAccount
  name: metrics-server
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  labels:
    k8s-app: metrics-server
  name: system:metrics-server
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:metrics-server
subjects:
- kind: ServiceAccount
  name: metrics-server
  namespace: kube-system
---
apiVersion: v1
kind: Service
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server
  namespace: kube-system
spec:
  ports:
  - name: https
    port: 443
    protocol: TCP
    targetPort: https
  selector:
    k8s-app: metrics-server
---
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server
  namespace: kube-system
spec:
  selector:
    matchLabels:
      k8s-app: metrics-server
  strategy:
    rollingUpdate:
      maxUnavailable: 0
  template:
    metadata:
      labels:
        k8s-app: metrics-server
    spec:
      containers:
      - args:
        - --cert-dir=/tmp
        - --secure-port=10250
        - --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname
        - --kubelet-use-node-status-port
        - --metric-resolution=15s
        - --kubelet-insecure-tls
        image: registry.k8s.io/metrics-server/metrics-server:v0.7.2
        imagePullPolicy: IfNotPresent
        livenessProbe:
          failureThreshold: 3
          httpGet:
            path: /livez
            port: https
            scheme: HTTPS
          periodSeconds: 10
        name: metrics-server
        ports:
        - containerPort: 10250
          name: https
          protocol: TCP
        readinessProbe:
          failureThreshold: 3
          httpGet:
            path: /readyz
            port: https
            scheme: HTTPS
          initialDelaySeconds: 20
          periodSeconds: 10
        resources:
          requests:
            cpu: 100m
            memory: 200Mi
        securityContext:
          allowPrivilegeEscalation: false
          capabilities:
            drop:
            - ALL
          readOnlyRootFilesystem: true
          runAsNonRoot: true
          runAsUser: 1000
          seccompProfile:
            type: RuntimeDefault
        volumeMounts:
        - mountPath: /tmp
          name: tmp-dir
      nodeSelector:
        kubernetes.io/os: linux
      priorityClassName: system-cluster-critical
      serviceAccountName: metrics-server
      volumes:
      - emptyDir: {}
        name: tmp-dir
---
apiVersion: apiregistration.k8s.io/v1
kind: APIService
metadata:
  labels:
    k8s-app: metrics-server
  name: v1beta1.metrics.k8s.io
spec:
  group: metrics.k8s.io
  groupPriorityMinimum: 100
  insecureSkipTLSVerify: true
  service:
    name: metrics-server
    namespace: kube-system
  version: v1beta1
  versionPriority: 100
```

now when we get hpa current cpu load will show
cpu: 0%/50% 

so we can try to load test again

run pod for testing
```bash
kubectl exec -it load-generator -- /bin/sh
```

execute curl command with infinity loop 
```bash
while true; do wget -q -O- http://nginx-hpa-service; done
```

verify hpa
```bash
watch -n 1 kubectl get hpa
```

see pod 
```bash
watch -n 1 kubectl get pod
```
