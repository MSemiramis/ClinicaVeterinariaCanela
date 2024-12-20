import { Proveedor } from "./Proveedor";
import { Persona } from "./Persona"
import { Veterinaria } from "./Veterinaria";
import * as fs from "fs";
import { Cliente } from "./Cliente";
import { Paciente } from "./Paciente";

export class RedVeterinaria {
   protected veterinarias: Veterinaria[];
   protected proveedores: Proveedor[];
   protected contador: number;
   readonly RUTA_DATOS : string = "./datos/red_veterinaria.json";

   constructor(){
       this.veterinarias = [];
       this.proveedores = [];
       this.contador = 0;
   }

   //Funciones para JSON

    guardarEnJSON(): void {
        const data = {
            veterinarias: this.veterinarias,
            proveedores: this.proveedores,
            contador: this.contador
        };

        fs.writeFileSync(this.RUTA_DATOS, JSON.stringify(data, null, 2), "utf-8");
        
        console.log(`Datos Actualizados.`);
    }

    cargarDesdeJSON(): void {
        if (fs.existsSync(this.RUTA_DATOS)) {
            const data = JSON.parse(fs.readFileSync(this.RUTA_DATOS, "utf-8"));
    
            // Cargar veterinarias
            this.veterinarias = data.veterinarias.map((vet: any) => {
                const veterinaria = new Veterinaria(
                    vet.nombre,
                    vet.direccion,
                    vet.telefono,
                    vet.id
                );
    
                // Cargar clientes dentro de la veterinaria
                if (vet.clientes && vet.clientes.length > 0) {
                    veterinaria.getClientes().push(...vet.clientes.map((cli: any) => {
                        // Crear el primer paciente para el constructor
                        const primerPaciente = new Paciente(
                            cli.mascotas[0].id,
                            cli.mascotas[0].nombre,
                            cli.mascotas[0].especie
                        );
                    
                        // Crear el cliente con el primer paciente
                        const cliente = new Cliente(
                            cli.id,
                            cli.nombre,
                            cli.direccion,
                            cli.telefono,
                            primerPaciente
                        );
                    
                        // Agregar los demás pacientes al cliente (si los hay)
                        for (let i = 1; i < cli.mascotas.length; i++) {
                            const paciente = new Paciente(
                                cli.mascotas[i].id,
                                cli.mascotas[i].nombre,
                                cli.mascotas[i].especie
                            );
                            cliente.getPacientes().push(paciente);
                        }
                    
                        return cliente;
                    }));
                }
    
                return veterinaria;
            });
    
            // Cargar proveedores
            this.proveedores = data.proveedores.map((prov: any) => {
                const proveedor = new Proveedor(
                    prov.id,
                    prov.nombre,
                    prov.telefono,
                    prov.direccion,
                    prov.productos[0] || "" // Cargar el primer producto para cumplir con el constructor
                );

                // Agregar los productos restantes
                for (let i = 1; i < prov.productos.length; i++) {
                    proveedor.addProduct(prov.productos[i]);
                }

                return proveedor;
            });
    
            // Cargar contador
            this.contador = data.contador;
            console.log(`Datos cargados correctamente.`);
        } else {
            console.log(`Informacion de Veterinarias no encontrada.`);
        }
    }

    // Generar los id para veterinarias y proveedores incrementando el contador
    public generarId(prefijo:string): string {
        this.contador++;
        return prefijo + this.contador; 
    }

    // Métodos Veterinarias

    altaVeterinaria(nombre: string, direccion: string, telefono: number): void {
        const id = this.generarId("VET"); 
        const nuevaVeterinaria = new Veterinaria(nombre, direccion, telefono, id); 
        this.veterinarias.push(nuevaVeterinaria); 
        console.log(`Veterinaria ${nombre} agregada con ID: ${id}`);

        this.guardarEnJSON();

    }


    // Elimina veterinaria por ID
    bajaVeterinaria(id: string) : void {
        let dimA = this.veterinarias.length; 
        this.veterinarias = this.veterinarias.filter(vet => vet.getId() !== id); 
        let dimD = this.veterinarias.length; 

        if (dimA > dimD) {
            console.log(`Realizando Baja...`);
            console.log(`La veterinaria con ID ${id} fue eliminada exitosamente.`);
            this.guardarEnJSON();

        } else {
            console.log(`No se encontró ninguna veterinaria con ID ${id} para eliminar.`);
        }

    }

    modificarVeterinaria(id: string, nombre?: string, direccion?: string, telefono?: number): void {
        let veterinariaEncontrada: boolean = false; 
        this.veterinarias.forEach(vet => {
            if (vet.getId() === id) {
                veterinariaEncontrada = true; 
                if (nombre) vet.setNombre(nombre);
                if (direccion) vet.setDireccion(direccion);
                if(telefono) vet.setTelefono(telefono);
                console.log(`Veterinaria con ID: ${id} modificada.`);

                this.guardarEnJSON();
             return
            }
        });
    
        // Si no encontramos la veterinaria, mostramos un mensaje
        if (!veterinariaEncontrada) {
            console.log(`Veterinaria con ID: ${id} no encontrada.`);
        }

    }

    public buscarVeterinariaPorID(id: string): number{
        let index = -1;
        for (let i = 0; i < this.veterinarias.length; i++) {
          if (this.veterinarias[i].getId() === id) {
            index = i;
          break;
          }
        }
        return index;
    }

    public buscarProveedorPorID(id: string): number{
        let index = -1;
        for (let i = 0; i < this.proveedores.length; i++) {
          if (this.proveedores[i].getId() === id) {
            index = i;
          break;
          }
        }
        return index;
    }
 
    public buscarVeterinariaPorNombre(nombre: string): number{
        let index = -1;
        for (let i = 0; i < this.veterinarias.length; i++) {
          if (this.veterinarias[i].getNombre() === nombre) {
            index = i;
          break;
          }
        }
        return index;
    }

    public devolverVeterinariaXId (id: string): Veterinaria | undefined {
        let index : number = this.buscarVeterinariaPorID(id);
        if (index != -1){
            return this.veterinarias[index]
        } else{
            console.log('Veterinaria no encontrada. Intente con un ID distinto.')
            return undefined;
        }
        
    }

    public devolverVeterinariaXNombre (nombre: string): Veterinaria {
        let index : number = this.buscarVeterinariaPorNombre(nombre);
        if (index != -1){
            return this.veterinarias[index];
        } else{
            console.log('Veterinaria no encontrada. Mostrando ultima Veterinaria agregada...')
            return this.veterinarias[this.veterinarias.length-1];
        }
        
    }

    // Métodos para Proveedores
    altaProveedor(nombre: string, telefono: number, direccion: string, producto: string): void {
        const id = this.generarId("PROV"); 
        const nuevoProveedor = new Proveedor(id, nombre, telefono, direccion, producto); 
        this.proveedores.push(nuevoProveedor); 
        console.log(`Proveedor ${nombre} agregado con ID: ${id}`);

        this.guardarEnJSON();

    }

    // Elimina veterinaria por ID
    bajaProveedor(id: string): void {
        let dimA = this.proveedores.length; 
        this.proveedores = this.proveedores.filter(prov => prov.getId() !== id); 
        let dimD = this.proveedores.length; 

        if (dimA > dimD) {
            console.log(`Realizando Baja...`);
            console.log(`El Proveedor con ID ${id} fue eliminado exitosamente.`);

            this.guardarEnJSON();
        } else {
            console.log(`No se encontró ningun Proveedor con ID ${id} para eliminar.`);
        }

    }

    modificarProveedor(id: string, nombre?: string, telefono?: number, direccion?:string): void {
        let proveedorEncontrado: boolean = false;
    
        this.proveedores.forEach(p => {
            if (p.getId() === id) {
                proveedorEncontrado = true; 
                if (nombre) p.setNombre(nombre);
                if (telefono) p.setTelefono(telefono);
                if (direccion) p.setDireccion(direccion);
                console.log(`Proveedor con ID: ${id} modificado.`);

                this.guardarEnJSON();
            }
            return
        });
    
        // Si no encontramos el proveedor, mostramos un mensaje
        if (!proveedorEncontrado) {
            console.log(`Proveedor con ID: ${id} no encontrado.`);
        }

    };

    listarVeterinarias(): void {
        if (this.veterinarias.length === 0) {
            console.log("\nNo hay veterinarias registradas.");
            return;
        }

        this.veterinarias.forEach((v) => {
            console.log(`\nNombre: ${v.getNombre()}`);
            console.log(`Direccion: ${v.getDireccion()}`);
            console.log(`Telefono: ${v.getTelefono()}`);
            console.log(`Id: ${v.getId()}`);
            console.log(`Clientes a cargo de la Veterinaria: ${v.getCantClientes()}`);
        });
    }
    
    listarProveedores(): void {
        if (this.proveedores.length === 0) {
            console.log("\nNo hay proveedores registrados.");
            return;
        }
        
        this.proveedores.forEach((p) => {
            console.log(`\nNombre: ${p.getNombre()}`);
            console.log(`Telefono: ${p.getTelefono()}`);
            console.log(`Direccion: ${p.getDireccion()}`);
            p.mostrarProductos();
            console.log(`Id: ${p.getId()}`);
        });
    }


}


