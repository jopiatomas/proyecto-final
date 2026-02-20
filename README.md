# Quickish

![logo-quickish](https://github.com/user-attachments/assets/0cad52c3-4de8-4c9d-b524-2bfafb5b8020)

Quickish es una aplicación de pedidos de comida a domicilio en proceso de desarrollo. Permite a los Clientes explorar restaurantes y gestionar pedidos; a los Restaurantes, administrar su catálogo y procesar pedidos; al Repartidor transportar pedidos desde el Restaurante a la dirección del Cliente y al Administrador, supervisar usuarios.
___

## Equipo de trabajo
- [Tomas Jopia](https://github.com/jopiatomas)
- [Lucas Monti](https://github.com/Lucasmonti)
- [Bruno Logghe](https://github.com/brunologghe)
- [Felipe Alvarez](https://github.com/felialvarez)
___

# Requisitos previos
Antes de correr el proyecto, asegurate de tener instalados globalmente:
- [Node.js](https://nodejs.org/) (Se recomienda v22+)
- [Angular CLI](https://angular.io/cli)
- [json-server](https://www.npmjs.com/package/json-server)
- [Java JDK](https://adoptium.net/) (Se recomienda JDK 17+)
- [MySQL](https://www.mysql.com/downloads/)

Instala Angular CLI y json-server de la siguiente manera:
```bash
npm install -g @angular/cli json-server
```
___

# Pasos para hacer funcionar la aplicación

1. **Instala las dependencias del frontend:**
   ```bash
   npm install
   ```
2. **Navega hasta la carpeta del proyecto frontend:**
   ```bash
   cd code
   ```
3. **Corre el proyecto frontend:**
   ```bash
   ng serve -o
   ```
4. **Configura y ejecuta el backend** (necesario para el funcionamiento completo del sistema):

   - **Clona el repositorio del backend:**
     ```bash
     git clone https://github.com/jopiatomas/proyecto-final
     ```
   - **Ingresa a la carpeta del backend:**
     ```bash
     cd proyecto-final
     ```
   - **Configura la conexión a la base de datos MySQL:**
     - Crea una base de datos nueva en MySQL (por ejemplo, `quickish_db`).
     - Abre el archivo `src/main/resources/application.properties` en el backend.
     - Modifica las siguientes líneas con los datos de tu base de datos local:
       ```
       spring.datasource.url=jdbc:mysql://localhost:3306/quickish_db
       spring.datasource.username=TU_USUARIO
       spring.datasource.password=TU_PASSWORD
       ```
   - **Ejecuta el backend en Visual Studio Code:**
     - Abre una nueva ventana en VS Code.
     - Selecciona `File > Open Folder...` y elige la carpeta del backend.
     - Busca el archivo principal `PedidosYaApplication.java`.
     - Haz clic en el botón de "Run" (▶️) sobre la función `main` o en la barra superior.
     - El backend se compilará y ejecutará automáticamente en la consola de VS Code.

     > **Importante:** Asegúrate de tener Java JDK instalado y las extensiones de Java configuradas en Visual Studio Code.  
     > Además, el backend debe estar corriendo antes de utilizar la aplicación frontend para que el sistema funcione correctamente.

5. **¡Listo! Ya podés utilizar Quickish sin problemas.**
___

# Tecnologías utilizadas

- **Frontend:** Angular
- **Backend:** Spring Boot (Java)
- **Base de datos:** MySQL

---
