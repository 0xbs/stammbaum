# Stammbaum

Familienstammbäume auf einem Webhosting anzeigen.

Die Darstellung basiert auf [donatso/family-chart](https://github.com/donatso/family-chart)
mit angepassten Feldnamen und Styling.

Tipp: Mit dem Tool [0xbs/graft](https://github.com/0xbs/graft)
können Bäume zusammengeführt und validiert werden.


## Lokal ausführen

Mit einem statischen Webserver:
```shell
python3 -m http.server 8358 -d public
```

Oder mit jedem anderen statischen Server, der den Ordner `public/` ausliefert, zum Beispiel:
```shell
docker run --rm \
    --publish 8358:80 \
    --volume "$PWD/public":/usr/share/nginx/html:ro \
    nginx:alpine
```

Danach http://localhost:8358 öffnen.


## Deployment

Kopiere den Inhalt(!) des Ordners `public` auf einen statischen Webspace oder Webserver.
PHP ist nicht erforderlich.

Änderungen an den Personendaten erfolgen direkt in `public/data/data.json`.


## Datenformat

Das Datenformat deckt etwa 90 % der Anwendungsfälle ab.
Nicht alles lässt sich derzeit vollständig abbilden, zum Beispiel mehrere Ehen.

```json5
{
  "id": "936323c7-0f0d-4b2d-b623-c469666943fd",
  "data": {
    // alle Datenfelder außer gender sind optional
    "gender": "M",
    "first_name": "Maximilian",
    "family_name": "Mustermann"
  },
  // Beziehungen zu anderen Personen
  "rels": {
    "spouses": [
      "a0bf99b9-3b63-464c-907b-08b802e96592"
    ],
    "children": [
      "1f6c9b7c-d3f5-4084-9c97-d4d89251061f",
      "737c3cf8-5334-47aa-ba95-4adf8c427120"
    ],
    "father": "92c25adc-83b7-433b-9469-516c263e1217",
    "mother": "9d4b70d5-848b-418a-87b2-94c693ac7fe4"
  }
}
```

Alle Felder außer `gender` sind optional.

| Datenfeld       | Beispiel        | Beschreibung                                             |
|-----------------|-----------------|----------------------------------------------------------|
| gender          | F               | Erforderlich, `M` oder `F`                               |
| nick_name       | Maxi            | Spitzname, wird kursiv dargestellt                       |
| first_name      | Maximilian      | Erster Vorname                                           |
| second_names    | Josef           | Weitere Vornamen, durch Leerzeichen getrennt             |
| family_name     | Mustermann      | Familienname (nach der Heirat)                           |
| birth_name      | Musterfrau      | Geburtsname                                              |
| birth_date      | 1970-01-01      | Geburtsdatum in ISO 8601, darf auch nur das Jahr sein    |
| birth_place     | München         | Geburtsort                                               |
| residence_place | München         | Wohnort(e)                                               |
| death_date      |                 | Sterbedatum in ISO 8601, darf auch nur das Jahr sein     |
| death_place     |                 | Sterbeort                                                |
| burial_place    |                 | Bestattungsort                                           |
| marriage_date   | 1995-06-06      | Heiratsdatum in ISO 8601, darf auch nur das Jahr sein    |
| marriage_place  | München         | Heiratsort                                               |
| divorce_date    |                 | Scheidungsdatum in ISO 8601, darf auch nur das Jahr sein |
| avatar_url      | avatars/max.jpg | Relative oder absolute Bild-URL                          |
| note            |                 | Freitext                                                 |
