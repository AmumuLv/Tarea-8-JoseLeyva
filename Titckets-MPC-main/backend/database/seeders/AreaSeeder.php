<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Area;

class AreaSeeder extends Seeder
{
    public function run(): void
    {
        $areas = [
            ['nombre' => 'Alcaldía', 'correo' => 'alcaldia@municasma.gob.pe'],
            ['nombre' => 'Comisiones de Regidores', 'correo' => 'regidores@municasma.gob.pe'],
            ['nombre' => 'Comité de Administración del Programa Vaso de Leche', 'correo' => 'vasodeleche@municasma.gob.pe'],
            ['nombre' => 'Comité Provincial de Seguridad Ciudadana (COPROSEC)', 'correo' => 'coprosec@municasma.gob.pe'],
            ['nombre' => 'Gerencia Municipal', 'correo' => 'gm@municasma.gob.pe'],
            ['nombre' => 'Oficina de Control Institucional', 'correo' => 'oci@municasma.gob.pe'],
            ['nombre' => 'Procuraduría Pública Municipal', 'correo' => 'procuraduria@municasma.gob.pe'],
            ['nombre' => 'Oficina General de Administración', 'correo' => 'administracion@municasma.gob.pe'],
            ['nombre' => 'Oficina General de Asesoría Jurídica', 'correo' => 'asesoriajuridica@municasma.gob.pe'],
            ['nombre' => 'Oficina General de Atención al Ciudadano y Gestión Documentaria', 'correo' => 'atencionalciudadano@municasma.gob.pe'],
            ['nombre' => 'Oficina General de Planeamiento y Presupuesto', 'correo' => 'planeamientoypresupuesto@municasma.gob.pe'],
            ['nombre' => 'Oficina de Archivo General', 'correo' => 'archivo@municasma.gob.pe'],
            ['nombre' => 'Oficina de Trámite Documentario', 'correo' => 'tramitedocumentario@municasma.gob.pe'],
            ['nombre' => 'Oficina de Relaciones Públicas e Imagen Institucional', 'correo' => 'imagen@municasma.gob.pe'],
            ['nombre' => 'Oficina de Tecnologías de Información y Comunicaciones', 'correo' => 'otic@municasma.gob.pe'],
            ['nombre' => 'Oficina de Recursos Humanos', 'correo' => 'RecursosHumanos@municasma.gob.pe'],
            ['nombre' => 'Oficina de Contabilidad', 'correo' => 'contabilidad@municasma.gob.pe'],
            ['nombre' => 'Oficina de Tesorería', 'correo' => 'tesoreria@municasma.gob.pe'],
            ['nombre' => 'Oficina de Abastecimiento y Gestión Patrimonial', 'correo' => 'abastecimiento@municasma.gob.pe'],
            ['nombre' => 'Oficina de Servicios Generales y Equipo Mecánico', 'correo' => 'serviciosgenerales@municasma.gob.pe'],
            ['nombre' => 'Oficina de Planeamiento y Modernización', 'correo' => 'planeamiento@municasma.gob.pe'],
            ['nombre' => 'Oficina de Presupuesto', 'correo' => 'presupuesto@municasma.gob.pe'],
            ['nombre' => 'Oficina de Programación Multianual de Inversiones', 'correo' => 'opmi@municasma.gob.pe'],
            ['nombre' => 'Gerencia de Administración Tributaria', 'correo' => 'tributaria@municasma.gob.pe'],
            ['nombre' => 'Subgerencia de Rentas', 'correo' => 'rentas@municasma.gob.pe'],
            ['nombre' => 'Subgerencia de Ejecución Coactiva', 'correo' => 'coactiva@municasma.gob.pe'],
            ['nombre' => 'Gerencia de Desarrollo Económico', 'correo' => 'desarrolloeconomico@municasma.gob.pe'],
            ['nombre' => 'Subgerencia de Desarrollo Industrial Agropecuario y Pesquero', 'correo' => 'agropecuario@municasma.gob.pe'],
            ['nombre' => 'Subgerencia de Desarrollo Turístico y Cultural', 'correo' => 'turismo@municasma.gob.pe'],
            ['nombre' => 'Subgerencia de Comercio, Licencias y Control Sanitario', 'correo' => 'licencias@municasma.gob.pe'],
            ['nombre' => 'Gerencia de Desarrollo Territorial e Infraestructura', 'correo' => 'territorial@municasma.gob.pe'],
            ['nombre' => 'Subgerencia de Desarrollo Territorial', 'correo' => 'desarrolloterritorial@municasma.gob.pe'],
            ['nombre' => 'Subgerencia de Estudios y Proyectos', 'correo' => 'proyectos@municasma.gob.pe'],
            ['nombre' => 'Subgerencia de Transporte y Seguridad Vial', 'correo' => 'transporte@municasma.gob.pe'],
            ['nombre' => 'Gerencia de Servicios Municipales y Gestión Ambiental', 'correo' => 'serviciosmunicipales@municasma.gob.pe'],
            ['nombre' => 'Subgerencia de Gestión Ambiental', 'correo' => 'gestionambiental@municasma.gob.pe'],
            ['nombre' => 'Subgerencia de Fiscalización Ambiental y ATM', 'correo' => 'fiscalizacionambiental@municasma.gob.pe'],
            ['nombre' => 'Subgerencia de Fiscalización y Policía Municipal', 'correo' => 'policiamunicipal@municasma.gob.pe'],
            ['nombre' => 'Subgerencia de Servicios Municipales', 'correo' => 'servicios@municasma.gob.pe'],
            ['nombre' => 'Subgerencia de Seguridad Ciudadana', 'correo' => 'serenazgo@municasma.gob.pe'],
            ['nombre' => 'Subgerencia de Gestión del Riesgo de Desastres', 'correo' => 'grd@municasma.gob.pe'],
            ['nombre' => 'Gerencia de Desarrollo Social', 'correo' => 'desarrollosocial@municasma.gob.pe'],
            ['nombre' => 'Subgerencia de Registro Civil y Separación Convencional', 'correo' => 'registrocivil@municasma.gob.pe'],
            ['nombre' => 'Subgerencia de Participación Vecinal, Educación y Deportes', 'correo' => 'participacionvecinal@municasma.gob.pe'],
            ['nombre' => 'Subgerencia de Programas Sociales', 'correo' => 'programassociales@municasma.gob.pe'],
            ['nombre' => 'Subgerencia Local de Empadronamiento', 'correo' => 'empadronamiento@municasma.gob.pe'],
            ['nombre' => 'Instituto Vial Provincial Municipal de Casma', 'correo' => 'ivp@municasma.gob.pe'],
            ['nombre' => 'Subgerencia de Infraestructura', 'correo' => 'SgInfrastructura@municasma.gob.pe'],
            ['nombre' => 'Subgerencia de Servicios Sociales', 'correo' => 'SgServiciossociales@municasma.gob.pe'],
        ];

        foreach ($areas as $areaData) {
            Area::firstOrCreate(
                ['nombre' => $areaData['nombre']],
                [
                    'correo' => $areaData['correo'],
                    'estado' => 'activo',
                ]
            );
        }

        $this->command->info('Se crearon ' . count($areas) . ' áreas correctamente.');
    }
}
