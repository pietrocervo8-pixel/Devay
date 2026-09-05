# Publicar Devay en todo el mundo

## Vercel

1. Entra en https://vercel.com/new.
2. Inicia sesión con GitHub o crea una cuenta.
3. Elige **Deploy without Git** o sube el proyecto desde un repositorio.
4. Sube la carpeta completa `mi-chat-ia`.
5. Ponle como nombre `devay-ai` para obtener una URL parecida a `devay-ai.vercel.app`.
6. En **Settings > Domains**, añade `Devay-AI.com` y configura los DNS que Vercel indique.

El archivo `vercel.json` ya está incluido. Vercel no añadirá la insignia de Netlify.

## Netlify

1. Entra en https://app.netlify.com/drop.
2. Arrastra esta carpeta completa al navegador.
3. Netlify generara una URL publica con HTTPS.
4. En Netlify, abre **Domain management** para conectar `Devay-AI.com`.
5. En el proveedor del dominio, configura los registros DNS que Netlify indique.

El archivo `netlify.toml` ya esta incluido. La aplicacion funciona como PWA y se puede instalar desde el navegador.

La etiqueta "Powered by Netlify" que puede aparecer en la vista previa es una insignia del panel de Netlify, no forma parte de Devay ni se muestra como contenido de la web. No se encuentra en el HTML, CSS o JavaScript del proyecto.

## Importante

Esta version guarda cuentas, tareas y conversaciones en el dispositivo mediante `localStorage`. La web sera publica, pero los datos no se sincronizaran entre dispositivos hasta agregar un backend y una base de datos.
