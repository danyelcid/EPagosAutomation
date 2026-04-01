/// <reference types="cypress" />

beforeEach('Iniciar sesión en el ambiente', () => {
    cy.fixture('credenciales').then((credenciales) => {
        cy.login(credenciales.usuario, credenciales.clave, credenciales.ambiente)
    })
})

it('Cargar las habilitaciones al convenio', () => {
    cy.contains('datosConvenio').click()

    cy.fixture('convenioPrep').then((data) => {
        //buscar el comercio
        cy.safeType('input[name="tabla:table:iterHead:0:headerColumn:filtro"]', data.comercio)

        cy.get('a').contains('epagos:comercio:' + data.comercio).click()
        cy.wait(1000)
        cy.get('a').contains('epagos:comercio:' + data.comercio).click()

        //buscar el convenio y lo selecciono para cargar las habilitaciones

        cy.safeType('input[name="panelPrincipal:convenios:table:iterHead:0:headerColumn:filtro"]', data.convenio)

        cy.contains('a', `epagos:convenio:${data.comercio}:${data.convenio}`).click()
        cy.wait(1000)
        cy.contains('a', `epagos:convenio:${data.comercio}:${data.convenio}`).click()

        //cargar habilitaciones con los datos del JSON
        cy.wrap(data.habilitaciones).each((habilitacion) => {
            cy.contains('a', 'nuevo').click()

            //pestaña Datos Básicos
            cy.get('#habilitado').check()

            //pestaña Interfaz MP
            cy.contains('a', 'Interfaz MP').click();

            cy.safeType('#conectores', habilitacion.conector,{delay: 15})
            cy.get('#conectores-autocomplete').should('be.visible').contains(habilitacion.conector).click();


            cy.get('[name="panelPrincipal:carrito:contenido:1:contenidoContainer:panelContenido:panelMPConector:mediosDePagoConectores:select"] option').contains(habilitacion.mpConector)
                .invoke('val')
                .as('conectorValue')

            cy.get('@conectorValue').then((conector) => {
                cy.get('[name="panelPrincipal:carrito:contenido:1:contenidoContainer:panelContenido:panelMPConector:mediosDePagoConectores:select"]').select(conector)
            })

            if (habilitacion.atributos) {
                /**
                 * La habilitacion de BANRED, es la unica de bancos que no usa ID_BANCO como atributo,
                 * por lo que no se carga el atributo ID_BANCO para esta habilitacion.
                 */
                if (habilitacion.medioPago != 'BANRED') {
                    cy.get('[name="panelPrincipal:carrito:contenido:1:contenidoContainer:panelContenido:panelAtributos:atributosValor:elemento:select"] option').contains('ID_BANCO')
                        .invoke('val')
                        .as('atributoValue')

                    cy.get('@atributoValue').then((value) => {
                        cy.get('[name="panelPrincipal:carrito:contenido:1:contenidoContainer:panelContenido:panelAtributos:atributosValor:elemento:select"]').select(value)
                    })

                    cy.safeType('[name="panelPrincipal:carrito:contenido:1:contenidoContainer:panelContenido:panelAtributos:atributosValor:contenidoExtra:contenidoAV:input"]', habilitacion.idBanco)

                    cy.get('.ap-agregarLista').contains('Agregar').click()

                }

                cy.get('[name="panelPrincipal:carrito:contenido:1:contenidoContainer:panelContenido:panelAtributos:atributosValor:elemento:select"] option').contains('ID_ORGANISMO')
                    .invoke('val')
                    .as('idOrganismoValue')

                cy.get('@idOrganismoValue').then((value) => {
                    cy.get('[name="panelPrincipal:carrito:contenido:1:contenidoContainer:panelContenido:panelAtributos:atributosValor:elemento:select"]').select(value)
                })

                cy.safeType('[name="panelPrincipal:carrito:contenido:1:contenidoContainer:panelContenido:panelAtributos:atributosValor:contenidoExtra:contenidoAV:input"]', data.idOrganismo)
                cy.get('.ap-agregarLista').contains('Agregar').click()

                cy.get('[name="panelPrincipal:carrito:contenido:1:contenidoContainer:panelContenido:panelAtributos:atributosValor:elemento:select"] option').contains('NUMERO_CONVENIO')
                    .invoke('val')
                    .as('numeroConvenioValue')

                cy.get('@numeroConvenioValue').then((value) => {
                    cy.get('[name="panelPrincipal:carrito:contenido:1:contenidoContainer:panelContenido:panelAtributos:atributosValor:elemento:select"]').select(value)
                })

                cy.safeType('[name="panelPrincipal:carrito:contenido:1:contenidoContainer:panelContenido:panelAtributos:atributosValor:contenidoExtra:contenidoAV:input"]', data.numeroConvenio)
                cy.get('.ap-agregarLista').contains('Agregar').click()
                cy.wait(200);

            }
            //pestaña Comision
            cy.contains('a', 'Comisión').click().wait(500);

            /**
             * URUPAGO es la unica habilitacion que tiene una comisión diferente a la comisión general de medio e pago, 
             * por lo que se carga la comisión específica para esta habilitación en caso de que la habilitación sea URUPAGO, 
             * caso contrario se carga la comisión general de medio e pago.
             */
            if (habilitacion.medioPago != "URUPAGO") {
                cy.safeType('[name="panelPrincipal:carrito:contenido:2:contenidoContainer:panelContenido:comisiones"]', data.comisionMP,{delay: 25})

                cy.get('div.wicket-aa-container')
                    .should('be.visible')
                    .contains(new RegExp(`^${data.comisionMP}$`))
                    .click()
            } else {
                cy.safeType('[name="panelPrincipal:carrito:contenido:2:contenidoContainer:panelContenido:comisiones"]', data.comisionUrupago,{delay: 25})
                /*cy.get('div.wicket-aa-container')
                    .should('be.visible')
                    .contains(new RegExp(`^${data.comisionUrupago}$`))
                    .click()*/
            }

            cy.safeType('[name="panelPrincipal:carrito:contenido:2:contenidoContainer:panelContenido:conceptos"]', habilitacion.conceptoMP,{delay: 25})

            const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

            /*cy.get('div.wicket-aa-container')
                .contains(new RegExp(`^${escapeRegex(habilitacion.conceptoMP)}$`))
                .click()*/

            cy.safeType('[name="panelPrincipal:carrito:contenido:2:contenidoContainer:panelContenido:ordinalComision"]', habilitacion.ordinal)

            //Comentarios y gardar
            cy.safeType('textarea.ap_abmpage_comentarios', 'Se agrega la habilitación de MP ' + habilitacion.medioPago, {delay: 15})
            cy.wait(500);

            cy.contains('a', 'Guardar').click();
           
            cy.get('.modal.fade.in').contains('a label', 'Si').then((element) => {
                cy.wrap(element).click({ force: true });
                
            })
        })
    })

})