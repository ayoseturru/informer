app.controller("Seed", function ($scope, DatabaseReference) {
  var fakeUniversitites = {
    "ULPGC": "Universidad de Las Palmas de Gran Canaria",
    "ULL": "Universidad de La Laguna",
    "UA": "Universidad de Alicante",
    "UPV": "Universidad Politécnica de Valencia",
    "UN": "Universidad de Navarra",
    "UGR": "Universidad de Granada",
    "UEM": "Universidad Europea de Madrid",
    "UM": "Universidad de Murcia",
    "US": "Universidad de Sevilla",
    "UV": "Universidad de Valencia",
    "USAL": "Universidad de Salamanca",
    "USC": "Universidad de Santiago de Compostela"
  };
  var university = {};
  var fakeCareers = {
    "Grado en Enfermería": true,
    "Grado en Fisioterapia": true,
    "Grado en Turismo": true,
    "Grado en Ingeniería en Tecnologías de la comunicación": true,
    "Grado en Ingeniería Informática": true,
    "Grado en Ingeniería Civil": true,
    "Grado en Ingeniería Geomática y Topografía": true,
    "Grado en Ingeniería Técnica Industrial": true,
    "Grado en Ingeniería en Tecnología Naval": true,
    "Grado en Ingeniería en Educación Social": true,
    "Grado en Educación Primaria": true,
    "Grado en Lengua Española y Literatura Hispánicas": true,
    "Grado en Lenguas Modernas": true,
    "Grado en Historia": true,
    "Grado en Traducción e Interpretación: Inglés-Francés": true,
    "Grado en Traducción e Interpretación: Inglés-Alemán": true,
    "Doble Grado en Traducción e Interpretación: Inglés-Francés e Inglés Alemán": true,
    "Grado en Ciencias del Mar": true,
    "Grado en Medicina": true,
    "Grado en Veterinaria": true,
    "Grado en Economía": true,
    "Grado en Administración y Dirección de Empresas": true,
    "Doble Grado en Administración y Dirección de Empresas y Derecho": true,
    "Grado en Relaciones Laborales y Recursos Humanos": true,
    "Grado en Derecho": true,
    "Grado en Trabajo Social": true,
    "Grado en Educación Social": true,
    "Grado en Educación Infantil": true,
    "Grado en Geografía y Ordenación del Territorio": true,
    "Grado en Arquitectura": true,
    "Grado en Ingeniería en Diseño Industrial y Desarrollo de Productos": true,
    "Grado en Ingeniería Química": true,
    "Grado en Ingeniería de Organización Industrial": true,
    "Doble Grado en Ingeniería Informática y Administración y Dirección de Empresas": true,
    "Doble Grado en Seguridad y Control de Riesgos": true
  };

  function addUniversities(path) {
    for (var key in fakeUniversitites) {
      university = {};
      university[key] = {name: fakeUniversitites[key], careers: fakeCareers};
      DatabaseReference.getReference(path ? path : "/universities").update(university);
    }
  }

  function addTags() {
    DatabaseReference.getReference("/tags").set(
      {
        flats: {name: "flats"},
        sports: {name: "sports"},
        books: {name: "books"},
        teachers: {name: "teachers"},
        notes: {name: "notes"},
        roomMate: {name: "roomMate"},
        music: {name: "music"},
        cinema: {name: "cinema"},
        transport: {name: "transport"},
        studyGroups: {name: "studyGroups"}
      }
    );
  }

  addUniversities();
  addUniversities("/universitiesForAccess");
  addTags();
});
