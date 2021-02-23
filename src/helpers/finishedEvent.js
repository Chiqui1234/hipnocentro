const helpers = {};
function humanize(slug) {
    slug = slug.replace(/-/g, ' ');
    slug = slug.replace(/\b[a-z]/, slug[0].toUpperCase()); // Esto es más efectivo que slug[0].toUpperCase() ó slug.charAt(0).toUpperCase().
    return slug;
}
helpers.finishedEvent = function(slug) {
    return `
    <style>
        a { color: rgb(238, 145, 24); text-decoration: none; margin: 0 5px 0 5px }
        a:hover { text-decoration: underline }
    </style>
    <div style="width: 90%;margin: 10px auto;padding-bottom: 10px;border-bottom: 2px solid rgb(238, 145, 24);">
        <img src="https://www.hipnocentro.com/2020/wp-content/uploads/2020/06/cabecera_email_hipnocentro.jpg" width="100%" />
        <h1 style="color: rgb(61, 64, 135);">Gracias por apuntarte</h1>
        <p>Por favor, ten los recursos para ver luego de tu seminario para ${humanize(slug)}:</p>
        <ul>
            <li>${slug == 'adelgazar' ? '<a href="https://www.hipnocentro.com/audios-para-adelgazar-con-hipnosis/">Audios para adelgazar con Hipnosis</a>' : '<a href="https://www.hipnocentro.com/apoyo-para-dejar-de-fumar-con-hipnosis/">Apoyo para dejar de fumar con Hipnosis</a>'}</li>
            <li>${slug == 'adelgazar' ? '<a href="https://panel.hipnocentro.com/resources/adelgazar/anti-sabotaje.jpg">Frase anti-sabotaje</a>' : '<a href="https://panel.hipnocentro.com/resources/dejar-de-fumar/cronologia-de-recuperacion.jpg">Cronología de recuperación</a>'}</li>
            <li>${slug == 'adelgazar' ? '<a href="https://panel.hipnocentro.com/resources/adelgazar/hipnocentro-laminas.pdf">9 reglas de oro</a>' : '<a href="https://panel.hipnocentro.com/resources/dejar-de-fumar/tarjeta-tabaco-pdf.pdf">Frases anti-sabotaje</a>'}</li>
        </ul>
    </div>
    `;
};

module.exports = helpers;