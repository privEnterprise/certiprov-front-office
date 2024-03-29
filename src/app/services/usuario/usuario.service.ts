import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICE } from '../../config/config';
import { Usuario } from '../../models/usuario.model';


import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { Router } from '@angular/router';



@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  //atributos
  usuario:Usuario;
  token:string;

  constructor(public http:HttpClient, public router:Router) {
      this.cargarStorage();
   }


  cargarStorage(){
    if (localStorage.getItem('token')) {

      this.token = localStorage.getItem('token');
      this.usuario = JSON.parse(localStorage.getItem('usuario'));
      
    }else{
      this.token = '';
      this.usuario = null;
    }
  }
  guardatStorage(doc:string, token:string, usuario:Usuario){
      
    localStorage.setItem('doc', doc);
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));

    this.usuario = usuario;
    this.token = token ;

  }

  actualizaStorage(usuario:Usuario){
    if (localStorage.getItem('usuario')) {
   
      localStorage.removeItem('usuario');

    }
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  logout(){
    this.usuario = null;
    this.token = '';

    localStorage.removeItem('doc');
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    this.router.navigate(['/login']);

  }

  login(usuario:Usuario, recordar:boolean=false){

    if (recordar) {
      localStorage.setItem('email',usuario.EMAIL_USUARIO);
    }else{
      localStorage.removeItem('email');
    }


    let url = URL_SERVICE + 'autenticar';

    return this.http.post(url, usuario)
                    .pipe(
                      map((resp:any) =>{
  
                        this.guardatStorage(resp.doc_usu,resp.token,resp.usuario);
  
                        return true;
  
                      })
                      
                    )
    
  }

  crearUsuario(usuario:Usuario){
    
    let url = URL_SERVICE + 'usuarios';

    return this.http.post(url, usuario)
                    .pipe(
                      map((resp:any) =>{
                        
                        Swal.fire({
                          title: 'Bien Hecho!',
                          text: 'Se registro el usuario '+usuario.EMAIL_USUARIO+' ahora podras descargar tus certificados' ,
                          type: 'success',
                          confirmButtonText: 'Genial'
                        })
                          return resp.usuario;
                      })
                    )

  }

  estaLogueado(){
    return (this.token.length > 5 ) ? true : false;
  }

  actualizarUsuario(doc_usuario:string,usuActualizar:Usuario){
    
    let url = URL_SERVICE + 'usuarios/actualizar/' + doc_usuario;

    return this.http.put(url, usuActualizar, {
                      headers:{
                        'token': this.token
                      }
                    })
                    .pipe(
                      map((resp:any)=>{
                        Swal.fire({
                          title: 'Bien Hecho!',
                          text: resp.message,
                          type: 'success',
                          confirmButtonText: 'Genial'
                        })
                        return resp.usuario;
                      })
                    )
  }

  cargarUsuarios(desde:number = 0){

    let url = URL_SERVICE + 'usuarios?desde=' + desde;

    return this.http.get(url, {
      headers:{
        'token': this.token
      }
    })

  }

  buscarUsuarios(termino:string){
    let url = URL_SERVICE + 'busqueda/entidad/usuarios/' + termino;

    return this.http.get(url, {
      headers:{
        'token': this.token
      }
    }).pipe(
      map((resp:any)=> resp.usuarios)
    )

  }


}
