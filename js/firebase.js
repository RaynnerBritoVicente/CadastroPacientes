const firebaseConfig = {
  apiKey: "AIzaSyBPwurtH3m0K9_HknyNG1PDtXoaf822d7Y",
  authDomain: "bdpaciente.firebaseapp.com",
  projectId: "bdpaciente",
  storageBucket: "bdpaciente.appspot.com",
  messagingSenderId: "746521052391",
  appId: "1:746521052391:web:51075f2d68d05322e64e42"
};

//Inicializando o Firebase
firebase.initializeApp(firebaseConfig)
//Definindo a URL padrão do site
const urlApp = 'http://127.0.0.1:5500'

function logaGoogle(){
  const provider = new firebase.auth.GoogleAuthProvider()
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      window.location.href = 'menu.html'
    }).catch((error) => {
      alert(`Erro ao efetuar o login: ${error.message}`)
    })
}

function verificaLogado(){
  firebase.auth().onAuthStateChanged(user => {
    if(user){ //contém dados de login?
      //Salvamos o id do usuário localmente
      localStorage.setItem('usuarioId', user.uid)

      //Inserindo a imagem do usuário
      let imagem = document.getElementById('imagemUsuario')

      user.photoURL
        ? imagem.innerHTML += `<img src="${user.photoURL}" title="${user.displayName}" class="img rounded-circle me-3" width="48">`
        : imagem.innerHTML += '<img src="imgs/iconeEnfermeira.svg" title="Usuário sem foto" class="img rounded-circle me-3" width="32">'

    }else{
      localStorage.removeItem('usuarioId') //Removemos o id salvo
      window.location.href = 'index.html' //direcionamos para o login
    }
  })
}

function logoutFirebase(){
  firebase.auth().signOut()
  .then(function(){
    localStorage.removeItem('usuarioId')
    window.location.href = 'index.html'
  })
  .catch(function(error){
    alert(`Não foi possivel efetuar o logout: ${error.message}`)
  })
}

// Em manutenção...
async function salvaUsuario(usuario) {
  //evento submit do formulário
  document.getElementById('formCadastroUser').addEventListener('submit', function (event){
    event.preventDefault()
    const usuario = {
      nomeUsuario: document.getElementById('nomeUsuario').value,
      senhaUser: document.getElementById('senha').value,
      especialidade: document.getElementById('especialidade').value
    }
    salvaUsuario(usuario)
    window.location.href = 'index.html'
  })
}

async function salvaPaciente(paciente) {
  //obtendo o usuário atual
  let usuarioAtual = firebase.auth().currentUser
  try {
    await firebase.database().ref('pacientes').push({
      ...paciente,
      usuarioInclusao: {
        uid: usuarioAtual.uid,
        nome: usuarioAtual.displayName
      }
    })
    alert('✔ Registro incluído com sucesso!')

    //Limpar o formulário
    document.getElementById('formCadastroPacientes').reset()

  } catch (error) {
    alert(`❌Erro ao salvar: ${error.message}`)
  }
}
//evento submit do formulário
document.getElementById('formCadastroPacientes').addEventListener('submit', function (event){
  event.preventDefault()
  const paciente = {
    nome: document.getElementById('nomePaciente').value,
    genero: document.getElementById('genero').value,
    dataNasc: document.getElementById('dataNasc').value,
    tipoSangue: document.getElementById('tipoSangue').value,
    rg: document.getElementById('rg').value,
    cpf: document.getElementById('cpf').value,
    cep: document.getElementById('cep').value,
    estado: document.getElementById('estado').value,
    municipio: document.getElementById('municipio').value,
    logradouro: document.getElementById('logradouro').value,
    obs: document.getElementById('obs').value
  }
  salvaPaciente(paciente)
})

async function carregaPacientes(){
  const tabela = document.getElementById('dadosTabela')
  const usuarioAtual = localStorage.getItem('usuarioId')

  await firebase.database().ref('pacientes').orderByChild('nome')
  .on('value',(snapshot) => {
    //Limpamos a tabela
    tabela.innerHTML = ``
    if(!snapshot.exists()) { //não existe o snapshot?
      tabela.innerHTML = `<tr class='danger'><td colspan='8'>Ainda não existe nenhum registro cadastrado.</td></tr>`
    } else { //se existir o snapshot, montamos a tabela
      snapshot.forEach(item => {
        const dados = item.val() //obtém os dados
        const id = item.key //obtém o id

        const isUsuarioAtual = (dados.usuarioInclusao.uid === usuarioAtual)
        const botao = isUsuarioAtual
        ? `<button class='btn btn-sm btn-danger' onclick='removePaciente("${id}")' title='Excluir o registro atual'>🗑 Excluir</button>`
        : `🚫Indisponível`

        tabela.innerHTML += `
        <tr>
           <td>${dados.nome}</td>
           <td>${dados.genero}</td>
           <td>${dados.dataNasc}</td>
           <td>${dados.tipoSangue}</td>
           <td>RG: ${dados.rg} <br/> CPF: ${dados.cpf}</td>
           <td>${dados.cep}</td>
           <td>${dados.municipio}-${dados.estado}, ${dados.logradouro}</td>
           <td>${dados.obs}</td>
           <td>${botao}</td>
        </tr>
        `
      })
    }
  })
}

async function removePaciente(id){
  if(confirm('Deseja realmente apagar este paciênte?')){
    const pacientesRef = await firebase.database().ref('pacientes/'+id)

    //Remova o paciênte do Firebase
    pacientesRef.remove()
    .then(function(){
      alert('Paciênte removido com sucesso!')
    })
    .catch(function(error){
      alert(`Erro ao excluir o pêciente: ${error.message}. Tente novamente`)
    })
  }
}