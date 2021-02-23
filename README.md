# Requisitos
* Debes tener NodeJs y MongoDB instalados.
* Añade a tu PATH **HIPNOCENTRO_DB** con clave **hipnocentro**.
* Añade a tu PATH **HIPNOCENTRO_NO_REPLY_EMAIL_DIR** con clave **no-responder@hipnocentro.com**.
* Añade a tu PATH **HIPNOCENTRO_NO_REPLY_EMAIL_PASS** con clave <solicitar por privado>.
* Añade a tu PATH **HIPNOCENTRO_WARRANTY_CODE** con clave <solicitar por privado>.

# Compilar y ejecutar
```bash
npm run dev
```

Una vez compilado exitosamente, dirígete a la URL [localhost:3000](localhost:3000) (por defecto).

# Tareas y problemas
* Migrar fechas string a Date()
* Los emails que debe enviar luego del seminario es impreciso. Se envian antes o después.
* Ordenar los eventos por fecha en el panel de control.
* Algunos pagos de PayPal no entran al sistema, o entran marcando "0€" pagados.
