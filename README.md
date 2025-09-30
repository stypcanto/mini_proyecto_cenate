# PruebaAPI Fullstack - Spring Boot + React + PostgreSQL

Proyecto de ejemplo que expone una API REST para obtener información de pacientes desde PostgreSQL, con frontend en React y backend en Spring Boot, todo orquestado con Docker.

---

## 🛠 Tecnologías

- **Backend**: Java 17, Spring Boot 3.x, Spring Data JPA
- **Frontend**: React, Create React App
- **Base de datos**: PostgreSQL 15
- **Contenerización**: Docker, Docker Compose
- **Comunicación**: REST API JSON

---

## 📂 Estructura del proyecto

```yaml 

PruebaAPI_Fullstack/
├── backend/
│ ├── src/main/java/com/example/pruebaapi/
│ │ ├── controller/PacienteController.java
│ │ ├── model/Paciente.java
│ │ ├── repository/PacienteRepository.java
│ │ └── PruebaApiApplication.java
│ └── pom.xml
├── frontend/
│ ├── src/
│ ├── public/
│ └── package.json
├── docker-compose.yml
└── README.md
```


```yaml

---

## ⚙️ Configuración de entorno

Variables de conexión a PostgreSQL (backend `application.properties`):

```properties
spring.datasource.url=jdbc:postgresql://10.0.89.13:5432/maestro_cenate
spring.datasource.username=chatbot_cnt
spring.datasource.password=C3n3tQ123
spring.jpa.hibernate.ddl-auto=none
server.port=5000

```
🚀 Levantar el proyecto con Docker

1. Construir los contenedores:
```bash
docker-compose build
```

2. Iniciar los servicios:

```bash
docker-compose up -d
```

3.  Verificar contenedores en ejecución:
```bash
 docker ps
```

### Puertos expuestos:

- Backend Spring Boot: http://localhost:8080
- Frontend React: http://localhost
- PostgreSQL: 5432


### 🔗 Probar endpoints desde la terminal

```bash

styp@MacBook-Pro-de-Styp cenate % docker ps
CONTAINER ID   IMAGE             COMMAND                  CREATED         STATUS         PORTS                    NAMES
02ed55b63e84   cenate-frontend   "/docker-entrypoint.…"   6 seconds ago   Up 5 seconds   0.0.0.0:80->80/tcp       cenate-frontend
e85d41ded25f   cenate-backend    "java -jar app.jar"      6 seconds ago   Up 5 seconds   0.0.0.0:8080->8080/tcp   cenate-backend
38c15c0115c0   postgres:15       "docker-entrypoint.s…"   6 seconds ago   Up 6 seconds   0.0.0.0:5432->5432/tcp   cenate-db

styp@MacBook-Pro-de-Styp cenate % curl http://localhost:8080/api/hello
Hola desde Spring Boot!%    

styp@MacBook-Pro-de-Styp cenate % curl http://localhost:80                                                                                  styp@MacBook-Pro-de-Styp cenate % curl http://localhost:80            
<!doctype html><html lang="en"><head><meta charset="utf-8"/><link rel="icon" href="/favicon.ico"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" content="#000000"/><meta name="description" content="Web site created using create-react-app"/><link rel="apple-touch-icon" href="/logo192.png"/><link rel="manifest" href="/manifest.json"/><title>React App</title><link href="/static/css/main.77e67bd8.chunk.css" rel="stylesheet"></head><body><noscript>You need to enable JavaScript to run this app.</noscript><div id="root"></div><script>!function(e){function t(t){for(var n,i,a=t[0],c=t[1],f=t[2],p=0,s=[];p<a.length;p++)i=a[p],Object.prototype.hasOwnProperty.call(o,i)&&o[i]&&s.push(o[i][0]),o[i]=0;for(n in c)Object.prototype.hasOwnProperty.call(c,n)&&(e[n]=c[n]);for(l&&l(t);s.length;)s.shift()();return u.push.apply(u,f||[]),r()}function r(){for(var e,t=0;t<u.length;t++){for(var r=u[t],n=!0,a=1;a<r.length;a++){var c=r[a];0!==o[c]&&(n=!1)}n&&(u.splice(t--,1),e=i(i.s=r[0]))}return e}var n={},o={1:0},u=[];function i(t){if(n[t])return n[t].exports;var r=n[t]={i:t,l:!1,exports:{}};return e[t].call(r.exports,r,r.exports,i),r.l=!0,r.exports}i.e=function(e){var t=[],r=o[e];if(0!==r)if(r)t.push(r[2]);else{var n=new Promise((function(t,n){r=o[e]=[t,n]}));t.push(r[2]=n);var u,a=document.createElement("script");a.charset="utf-8",a.timeout=120,i.nc&&a.setAttribute("nonce",i.nc),a.src=function(e){return i.p+"static/js/"+({}[e]||e)+"."+{2:"0d7fcccf"}[e]+".chunk.js"}(e);var c=new Error;u=function(t){a.onerror=a.onload=null,clearTimeout(f);var r=o[e];if(0!==r){if(r){var n=t&&("load"===t.type?"missing":t.type),u=t&&t.target&&t.target.src;c.message="Loading chunk "+e+" failed.\n("+n+": "+u+")",c.name="ChunkLoadError",c.type=n,c.request=u,r[1](c)}o[e]=void 0}};var f=setTimeout((function(){u({type:"timeout",target:a})}),12e4);a.onerror=a.onload=u,document.head.appendChild(a)}return Promise.all(t)},i.m=e,i.c=n,i.d=function(e,t,r){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(i.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)i.d(r,n,function(t){return e[t]}.bind(null,n));return r},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="/",i.oe=function(e){throw console.error(e),e};var a=this.webpackJsonpfrontend_temp=this.webpackJsonpfrontend_temp||[],c=a.push.bind(a);a.push=t,a=a.slice();for(var f=0;f<a.length;f++)t(a[f]);var l=c;r()}([])</script><script src="/static/js/main.ff5f18ed.chunk.js"></script></body></html>%                                                                             styp@MacBook-Pro-de-Styp cenate % 

styp@MacBook-Pro-de-Styp cenate % curl http://localhost:8080/api/pacientes
[{"docPaciente":"12345678","nombre":"Juan Perez","fechaNacimiento":"1990-05-12","sexo":"M"},{"docPaciente":"87654321","nombre":"Maria Lopez","fechaNacimiento":"1985-11-23","sexo":"F"},{"docPaciente":"11223344","nombre":"Carlos Ramirez","fechaNacimiento":"1992-03-15","sexo":"M"},{"docPaciente":"22334455","nombre":"Ana Torres","fechaNacimiento":"1988-07-22","sexo":"F"},{"docPaciente":"33445566","nombre":"Luis Fernandez","fechaNacimiento":"1995-12-01","sexo":"M"},{"docPaciente":"44556677","nombre":"Sofia Morales","fechaNacimiento":"1991-08-10","sexo":"F"},{"docPaciente":"55667788","nombre":"Miguel Castillo","fechaNacimiento":"1989-05-30","sexo":"M"},{"docPaciente":"66778899","nombre":"Laura Gutierrez","fechaNacimiento":"1993-11-18","sexo":"F"},{"docPaciente":"77889900","nombre":"Diego Sanchez","fechaNacimiento":"1990-02-25","sexo":"M"},{"docPaciente":"88990011","nombre":"Valeria Cruz","fechaNacimiento":"1994-06-12","sexo":"F"},{"docPaciente":"99001122","nombre":"Jorge Alvarez","fechaNacimiento":"1987-09-05","sexo":"M"},{"docPaciente":"10111213","nombre":"Cecilia Rojas","fechaNacimiento":"1996-01-20","sexo":"F"},{"docPaciente":"11121314","nombre":"Fernando Diaz","fechaNacimiento":"1991-04-28","sexo":"M"},{"docPaciente":"12131415","nombre":"Patricia Vargas","fechaNacimiento":"1989-10-07","sexo":"F"}]%                                                                                                   

styp@MacBook-Pro-de-Styp cenate % curl http://localhost:8080/api/pacientes/12345678
{"docPaciente":"12345678","nombre":"Juan Perez","fechaNacimiento":"1990-05-12","sexo":"M"}%   


```

