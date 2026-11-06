import type { StructureResolver } from "sanity/structure";
import { VENDEDORES } from "./schemaTypes/reparto";

const OCULTOS = ["repartoCorreos", "solicitudCotizacion"];
const API = "2025-01-01";

/** Real requests only ("solicitud.*"); tests from localhost live under "solicitud-dev.*". */
const solicitudes = (S: Parameters<StructureResolver>[0], titulo: string, filtro: string, params = {}) =>
  S.documentList()
    .title(titulo)
    .apiVersion(API)
    .schemaType("solicitudCotizacion")
    .filter(`_type == "solicitudCotizacion" && _id in path("solicitud.*") ${filtro}`)
    .params(params)
    .defaultOrdering([{ field: "fecha", direction: "desc" }]);

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Contenido")
    .items([
      ...S.documentTypeListItems().filter((item) => !OCULTOS.includes(item.getId() ?? "")),
      S.divider(),
      S.listItem()
        .title("Reparto de cotizaciones")
        .child(
          S.list()
            .title("Reparto de cotizaciones")
            .items([
              S.listItem()
                .title("Contadores por vendedor")
                .child(S.document().schemaType("repartoCorreos").documentId("reparto.contadores")),
              S.listItem().title("Todas las solicitudes").child(solicitudes(S, "Todas las solicitudes", "")),
              S.divider(),
              ...VENDEDORES.map((v) => {
                const email = `${v}@alquileresymas.net`;
                return S.listItem()
                  .title(`Enviadas a ${v}`)
                  .child(solicitudes(S, `Enviadas a ${v}`, "&& asignadoA == $email", { email }));
              }),
              S.divider(),
              S.listItem()
                .title("Pruebas desde localhost")
                .child(
                  S.list()
                    .title("Pruebas desde localhost")
                    .items([
                      S.listItem()
                        .title("Contadores de prueba")
                        .child(S.document().schemaType("repartoCorreos").documentId("reparto-dev.contadores")),
                      S.listItem()
                        .title("Solicitudes de prueba")
                        .child(
                          S.documentList()
                            .title("Solicitudes de prueba")
                            .apiVersion(API)
                            .schemaType("solicitudCotizacion")
                            .filter(`_type == "solicitudCotizacion" && _id in path("solicitud-dev.*")`)
                            .defaultOrdering([{ field: "fecha", direction: "desc" }])
                        ),
                    ])
                ),
            ])
        ),
    ]);
