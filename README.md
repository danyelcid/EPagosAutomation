# Cómo instalar

## Clonar el Repositorio

Para clonar este repositorio, ejecuta el siguiente comando:

```
git clone https://github.com/danyelcid/payground.git

```

## Ejecutar localmente de las pruebas

1. Navega al directorio del proyecto:

```
cd payground
```

2. Instala las dependencias:

```
npm install
```

3. Crea el archivo `cypress/fixtures/credenciales.json`.
los valores de ambiente son 'test', 'prep', o 'prod'. 
pero por diferencias en la configuracion de los ambientes 
este script está pensado para correrse sobre prep

```
{
    "user": "usuario",
    "password": "contraseña",  
    "ambiente": "prep"
}
```
4. Abre Cypress:

```
npx cypress open
```

Esto lanzará el Ejecutor de Pruebas de Cypress, donde puedes ejecutar tus pruebas de manera interactiva.

## Documentación de la prueba (funcionalidades y requisitos)

### Funcionalidades Cubiertas

- Crear un convenio nuevo en la aplicación EPagos, incluyendo configuración de estado, nombre, descripción, atributos, tipo de volcado y monedas.
- Cargar habilitaciones para el convenio creado, cubriendo:
  - selección de comercio y convenio
  - pestañas de Datos Básicos, Interfaz MP y Comisión
  - asignación de conectores y medios de pago
  - agregado de atributos (ID_BANCO, ID_ORGANISMO, NUMERO_CONVENIO) según corresponda
  - validación de reglas específicas de URUPAGO/BANRED
- Verificar el convenio y habilitaciones ya creadas:
  - existencia del convenio en pantalla
  - valores de campos (habilitado, nombre, tipo de volcado, comisiones, etc.)
  - validación de atributos y comisiones por habilitación
- Crear concepto asociado al convenio si no se trata de `tipoTimbreDigital`:
  - crear concepto con sufijo configurado y código HG
  - validar que el concepto exista y contenga datos esperados
- Crear y validar properties del concepto y del convenio:
  - registrar properties en módulo EPAGOS con código de volcado
  - verificación en tabla de resultados

### Requisitos Previos

- Node.js + npm instalados.
- Dependencias instaladas con `npm install`.
- Acceso a la URL/ambiente de EPagos donde se ejecutará la prueba (preprod en el script de login).
- Cuenta y credenciales válidas para login 
- Fixtures adecuados ubicados en `cypress/fixtures/tipoDNC.json` con campos utilizados:
  - `comercio`, `convenio`, `nombre`, `idConvenioRc`, `marcaTalon`, `permiteAnulacion`, `procesarCodigoDeBarras`, `notificarTransaccionesConciliacion`, `tipoVolcado`, `codigoVolcado`, `comisionEPagos`, `monedas`, `habilitaciones`, `idOrganismo`, `numeroConvenio`, `comisionMP`, `comisionUrupago`, `desglose`, `tipoTimbreDigital`.

### Ejecutar la prueba específica

- Ejecutar todo el spec:
  - `npx cypress run --spec "cypress/e2e/00EPagos/crearConvenio.cy.js"`
- Ejecutar en modo interactivo:
  - `npx cypress open` y seleccionar el archivo.

### Notas

- El script usa acciones personalizadas (`cy.safeType`, `cy.setCheckbox`, `cy.login`) definidas en `cypress/support/commands.js`.
- Se recomienda limpiar datos de prueba o correr en un ambiente de pruebas dedicado para evitar interferencia con datos en uso.
