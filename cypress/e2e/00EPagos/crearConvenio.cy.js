/// <reference types="cypress" />

describe('Crear Convenio - Concepto - habilitaciones y Properties', () => {

    beforeEach('Iniciar sesión en el ambiente', () => {
        cy.fixture('credenciales').then((credenciales) => {
            cy.login(credenciales.usuario, credenciales.clave, credenciales.ambiente)
        })
    })

    it('Crear nuevo convenio', () => {
        cy.contains('Comercios').click()

        cy.fixture('tipoDNC').then((data) => {

            //filtar comercio y entrar al comercio
            cy.safeType('input[name="tabla:table:iterHead:0:headerColumn:filtro"]', data.comercio)

            cy.get('a').contains('epagos:comercio:' + data.comercio).click()
            cy.wait(1000)
            cy.get('a').contains('epagos:comercio:' + data.comercio).click()

            //buscar el convenio y se asegura que no exista antes de crearlo
            cy.safeType('[name="panelPrincipal:convenios:table:iterHead:0:headerColumn:filtro"]', data.convenio)
            cy.contains('label', `epagos:convenio:${data.comercio}:${data.convenio}`).should('not.exist')

            cy.get('a').contains('Agregar Convenio').click()

            //Configurar datos cargados desde el JSON
            cy.setCheckbox('[name="panelPrincipal:habilitado"]', data.habilitado)
            cy.get('[name="panelPrincipal:habilitado"]').should(data.habilitado ? 'be.checked' : 'not.be.checked');

            cy.safeType('input#sufijoCodigo', data.convenio)
            cy.safeType('input#nombre', data.nombre)
            cy.safeType('input#descripcionConvenio', data.nombre)

            data.idConvenioRc ? cy.safeType('#idConvenioRc', data.idConvenioRc) : null
            cy.setCheckbox('#marcaTalonRC', data.marcaTalon)
            cy.setCheckbox('#permiteAnulacionBackoffice', data.permiteAnulacion)
            cy.setCheckbox('#procesarCodigoDeBarras', data.procesarCodigoBarras)
            cy.setCheckbox('#notificarTransaccionesConciliacion', data.notificarTransaccionesConciliacion)

            //Concepto Principal para cuando este subida la funcionalidad en GUI con release correspondiente
            //data.conceptoPrincipal ? cy.safeType('#conceptoPrincipal', data.conceptoPrincipal) : null

            cy.get('select[name="panelPrincipal:tipoDeVolcado:select"] option').contains(data.tipoVolcado)
                .invoke('val')
                .as('vtipoVolcado')

            cy.get('@vtipoVolcado').then((value) => {
                cy.get('select[name="panelPrincipal:tipoDeVolcado:select"]').select(value)
            })

            if (data.tipoVolcado === 'VOLCAR_CON_COMISIONES') {
                cy.safeType('input#codigoGwHg', data.codigoVolcado)
            }

            cy.safeType('input#comision', data.comisionEPagos)
            cy.get('div#comision-autocomplete-container').should('be.visible').contains(data.comisionEPagos).click()

            data.monedas.forEach(moneda => {
                cy.get('[name="panelPrincipal:monedas:elemento:select"] option').contains(moneda)
                    .invoke('val')
                    .as('monedaValue')

                cy.get('@monedaValue').then((value) => {
                    cy.get('[name="panelPrincipal:monedas:elemento:select"]').select(value)
                })
                cy.get('.ap-agregarLista').contains('Agregar').click()
            })

            cy.safeType('textarea[name="comentario"]' , 'Creacion de convenio ' + data.convenio + ' con nombre ' + data.nombre)
            cy.get('a').contains('Guardar').click()

            cy.contains('.modal.fade.in a label', 'Si').last().then((element) => {
                cy.wrap(element).click({ force: true })
            })
            //validar que el convenio se haya creado
            cy.safeType('[name="panelPrincipal:convenios:table:iterHead:0:headerColumn:filtro"]', 'epagos:convenio:' + data.comercio + ':' + data.convenio)
            cy.get('tr').filter(':contains("Convenios")').should('contain', 'epagos:convenio:' + data.comercio + ':' + data.convenio)

        })

    })

    it('Cargar las habilitaciones al convenio', () => {
        cy.contains('Comercios').click()

        cy.fixture('tipoDNC').then((data) => {
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

                cy.safeType('#conectores', habilitacion.conector)
            cy.get('#conectores-autocomplete').should('be.visible').contains(habilitacion.conector).click();


            cy.get('[name="panelPrincipal:carrito:contenido:1:contenidoContainer:panelContenido:panelMPConector:mediosDePagoConectores:select"] option').contains(habilitacion.mpConector)
                .invoke('val')
                .as('conectorValue')

            cy.get('@conectorValue').then((conector) => {
                cy.get('[name="panelPrincipal:carrito:contenido:1:contenidoContainer:panelContenido:panelMPConector:mediosDePagoConectores:select"]').select(conector)
            })

            if (habilitacion.atributos) {
                /**
                 * si la habilitación no es de BANRED, se carga el atributo ID_BANCO con el valor del idBanco del JSON, 
                 * porque este atributo solo aplica para los MP que no son BANRED, 
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

            if (habilitacion.medioPago != "URUPAGO") {
                cy.safeType('[name="panelPrincipal:carrito:contenido:2:contenidoContainer:panelContenido:comisiones"]', data.comisionMP)

                cy.get('div.wicket-aa-container')
                    .should('be.visible')
                    .contains(new RegExp(`^${data.comisionMP}$`))
                    .click()
            } else {
                cy.safeType('[name="panelPrincipal:carrito:contenido:2:contenidoContainer:panelContenido:comisiones"]', data.comisionUrupago)
                cy.get('div.wicket-aa-container')
                    .should('be.visible')
                    .contains(new RegExp(`^${data.comisionUrupago}$`))
                    .click()
            }

            cy.safeType('[name="panelPrincipal:carrito:contenido:2:contenidoContainer:panelContenido:conceptos"]', habilitacion.conceptoMP)

            const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

            cy.get('div.wicket-aa-container')
                .contains(new RegExp(`^${escapeRegex(habilitacion.conceptoMP)}$`))
                .click()

            cy.safeType('[name="panelPrincipal:carrito:contenido:2:contenidoContainer:panelContenido:ordinalComision"]', habilitacion.ordinal)

            //Comentarios y gardar
            cy.safeType('textarea.ap_abmpage_comentarios', 'Se agrega la habilitación de MP ' + habilitacion.medioPago)
            cy.wait(500);

            cy.contains('a', 'Guardar').click();

            cy.get('.modal.fade.in').contains('a label', 'Si').last().then((element) => {
                cy.wrap(element).click({ force: true });
            })
        })
    })

})

it('Verificar convenio creado y sus habilitaciones', () => {

    cy.fixture('tipoDNC').then((data) => {
        cy.safeType('[name="tabla:table:iterHead:0:headerColumn:filtro"]', data.comercio)

        cy.get('a').contains('epagos:comercio:' + data.comercio).click().wait(1000)
        cy.wait(1000)
        cy.get('a').contains(data.comercio).click()

        cy.safeType('[name="panelPrincipal:convenios:table:iterHead:0:headerColumn:filtro"]', data.convenio)

        cy.get('a').contains('epagos:convenio:' + data.comercio + ':' + data.convenio).click().wait(1000)
        cy.wait(1000)
        cy.get('a').contains('epagos:convenio:' + data.comercio + ':' + data.convenio).click()

        //verificar datos cargados
        cy.get('#habilitado').should(data.habilitado ? 'be.checked' : 'not.be.checked')

        cy.get('label').contains(`epagos:comercio:${data.comercio}`).should('exist');
        cy.get('label').contains(`epagos:convenio:${data.comercio}:${data.convenio}`).should('exist');

        cy.get('input#nombre').should('have.value', data.nombre)
        cy.get('input#descripcionConvenio').should('have.value', data.nombre)

        cy.get('#idConvenioRc').should('have.value', data.idConvenioRc ? data.idConvenioRc : '')
        cy.get('#marcaTalonRC').should(data.marcaTalon ? 'be.checked' : 'not.be.checked')
        cy.get('#permiteAnulacionBackoffice').should(data.permiteAnulacion ? 'be.checked' : 'not.be.checked')
        cy.get('#procesarCodigoDeBarras').should(data.procesarCodigoBarras ? 'be.checked' : 'not.be.checked')
        cy.get('#notificarTransaccionesConciliacion').should(data.notificarTransaccionesConciliacion ? 'be.checked' : 'not.be.checked')

        cy.get('select[name="panelPrincipal:tipoDeVolcado:select"]  option[selected]').should('have.text', data.tipoVolcado)
        cy.get('#codigoGwHg').should('have.value', data.codigoVolcado ? data.codigoVolcado : '')
        /**
         * Faltan campos:
         * - conceptoPrincipal
         * - esta funcionalidad no esta disponible en el ambiente de prep, por lo que no se pueden cargar datos para verificar
         * - cy.get('#conceptoPrincipal').should('have.value', data.conceptoPrincipal ? data.conceptoPrincipal : '' )
         */

        cy.get('#comision').should('have.value', data.comisionEPagos)
        data.monedas.forEach(moneda => {
            cy.get('.ap-agregarLista .ap-orderedTable').should('contain', moneda)
        })

        cy.wrap(data.habilitaciones).each((habilitacion) => {
            const nombre = habilitacion.mpConector.split(':').pop()
            cy.contains('label', `epagos:habilitacionprocesador:${data.comercio}:${data.convenio}_web:${nombre}`)
                .should('exist')
                .click();

            if (habilitacion.atributos) {
                cy.get('a label').contains('Interfaz MP').click()
                cy.contains('label', "Listado de medios de pago conectores asociados")
                    .should('exist')
                    .should('be.visible');

                if (nombre != 'banred') {
                    cy.contains('tr', `ID_BANCO`).should('exist').and('contain', habilitacion.idBanco)
                }
                cy.contains('tr', `ID_ORGANISMO`).should('exist').and('contain', data.idOrganismo)
                cy.contains('tr', `NUMERO_CONVENIO`).should('exist').and('contain', data.numeroConvenio)
            }

            cy.get('a label').contains('Comisión').click()

            if (nombre != 'urupago') {
                cy.get('[name="panelPrincipal:carrito:contenido:2:contenidoContainer:panelContenido:comisiones"]')
                    .should('exist')
                    .should('be.visible')
                    .should('have.value', data.comisionMP)
            } else {
                cy.get('[name="panelPrincipal:carrito:contenido:2:contenidoContainer:panelContenido:comisiones"]')
                    .should('exist')
                    .should('be.visible')
                    .should('have.value', data.comisionUrupago)
            }
            cy.get('[name="panelPrincipal:carrito:contenido:2:contenidoContainer:panelContenido:conceptos"]')
                .should('exist')
                .should('be.visible')
                .should('have.value', habilitacion.conceptoMP)

            cy.get('[name="panelPrincipal:carrito:contenido:2:contenidoContainer:panelContenido:ordinalComision"]')
                .should('exist')
                .should('be.visible')
                .should('have.value', habilitacion.ordinal)
            cy.contains('a', 'Volver').click();
        })

    })

})

it('Crear concepto asociado al convenio y valida despues de creado', () => {
    cy.fixture('tipoDNC').then((data) => {
        if (!data.tipoTimbreDigital) {
            cy.contains('a', 'Conceptos').click()

            cy.contains('a', 'Nueva')
                .should('be.visible')
                .click()

            cy.setCheckbox('[name="panelPrincipal:habilitado"]', true)
            cy.safeType('input[name="panelPrincipal:contenidoSufijo:sufijo"]', `${data.comercio}:${data.convenio}`)
            cy.safeType('input[name="panelPrincipal:nombre"]', `Concepto ${data.comercio} - ${data.nombre}`)
            cy.safeType('input[name="panelPrincipal:descripcion"]', `Concepto ${data.comercio} - ${data.nombre}`)
            cy.safeType('input[name="panelPrincipal:codigoGwHg"]', data.desglose)

            cy.safeType('textarea[name="comentario"]', 'Se crea el concepto para el convenio ' + data.nombre)

            cy.get('a').contains('Guardar').click()

            cy.contains('.modal.fade.in a label', 'Si').last().then((element) => {
                cy.wrap(element).click({ force: true })
            })
            cy.safeType('input[name="tabla:table:iterHead:0:headerColumn:filtro"]', `epagos:concepto:${data.comercio}:${data.convenio}`)

            cy.get('label').contains(`epagos:concepto:${data.comercio}:${data.convenio}`)
                .should('exist')

            cy.safeType('input[tabla:table:iterHead:0:headerColumn:filtro]', `epagos:concepto:${data.comercio}:${data.convenio}`)
            cy.get('.ap-orderedTable tbody tr')
                .should('contain', `epagos:concepto:${data.comercio}:${data.convenio}`)
                .should('contain', `${data.desglose}`)
                .should('contain', 'EPAGOS')
                .should('exist');
        }
    })
})

it('Crear las properties del concepto y convenio las valida despues de creadas', () => {
    cy.fixture('tipoDNC').then((data) => {
        cy.contains('a', 'Properties')
            .should('be.visible')
            .click()
        //properties del concepto
        //Si el convenio es de tipo Timbre Digital, no se debe crear properties del concepto porque se usa un concepto ya existente para todos los convenios de este tipo, por lo que solo se crean properties del convenio
        if (!data.tipoTimbreDigital) {
            cy.get('a').contains('Nueva').click()
            cy.safeType('input[name="panelPrincipal:codigo"]', `epagos:concepto:${data.comercio}:${data.convenio}`)
            cy.get('select[name="panelPrincipal:modulo:select"]').select('EPAGOS')
            cy.safeType('input[name="panelPrincipal:descripcion"]', 'Código de volcado')
            cy.safeType('input[name="panelPrincipal:valor"]', data.desglose)
            cy.get('a').contains('+').click()
            cy.get('.ap-orderedTable').should('contain', `${data.desglose}`)

            cy.safeType('textarea[name="comentario"]', `Se agrega el codigo de volcado para el concepto ${data.comercio} - ${data.nombre}`)
      
            cy.get('a').contains('Guardar').click()

            cy.contains('.modal.fade.in a label', 'Si').last().then((element) => {
                cy.wrap(element).click({ force: true })
            })

            cy.safeType('input[name="tabla:table:iterHead:0:headerColumn:filtro"]', `epagos:concepto:${data.comercio}:${data.convenio}`)
            cy.get('.ap-orderedTable tbody tr')
                .should('contain', `epagos:concepto:${data.comercio}:${data.convenio}`)
                .should('contain', `${data.desglose}`)
                .should('contain', 'EPAGOS')
                .should('exist');
        }

        //properties del convenio
        cy.get('a').contains('Nueva').click()
        cy.safeType('input[name="panelPrincipal:codigo"]', `epagos:convenio:${data.comercio}:${data.convenio}`)
        cy.get('select[name="panelPrincipal:modulo:select"]').select('EPAGOS')
        cy.safeType('input[name="panelPrincipal:descripcion"]', 'Código de volcado')
        cy.safeType('input[name="panelPrincipal:valor"]', data.codigoVolcado)
        cy.get('a').contains('+').click()
        cy.get('.ap-orderedTable').should('contain', `${data.codigoVolcado}`)

        cy.safeType('textarea[name="comentario"]', `Se agrega el codigo de volcado para el convenio ${data.comercio} - ${data.nombre}`)

        cy.get('a').contains('Guardar').click()
        cy.contains('.modal.fade.in a label', 'Si').last().then((element) => {
            cy.wrap(element).click({ force: true })
        })
        cy.safeType('input[name="tabla:table:iterHead:0:headerColumn:filtro"]', `epagos:convenio:${data.comercio}:${data.convenio}`)
        cy.get('.ap-orderedTable tbody tr')
            .should('contain', `epagos:convenio:${data.comercio}:${data.convenio}`)
            .should('contain', `${data.codigoVolcado}`)
            .should('contain', 'EPAGOS')
            .should('exist');
    })
})
})