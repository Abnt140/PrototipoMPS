const chave_db = 'mps_tb_usuario'

function pegaUsuarios() {
  try { return JSON.parse(localStorage.getItem(chave_db)) || [] }
  catch { return [] }
}

function salvaUsuarios(lista) {
  localStorage.setItem(chave_db, JSON.stringify(lista))
}

function emailJaExiste(email) {
  return pegaUsuarios().some(u => u.email.toLowerCase() === email.toLowerCase())
}

function userJaExiste(user) {
  return pegaUsuarios().some(u => u.username.toLowerCase() === user.toLowerCase())
}

function insereUsuario(novo) {
  let lista = pegaUsuarios()
  lista.push({ ...novo, id: Date.now() })
  salvaUsuarios(lista)
}

function irPasso(de, para) {
  document.getElementById(de).classList.remove('active')
  document.getElementById(para).classList.add('active')
}

function checaLanding() {
  let val = document.getElementById('inp-landing').value.trim()
  let btn = document.getElementById('btn-landing')
  if (val.length > 0) {
    btn.disabled = false
    btn.style.background = '#1d9bf0'
  } else {
    btn.disabled = true
    btn.style.background = '#2f3336'
  }
}

function validaPasso1() {
  let nome  = pega('inp-nome')
  let user  = pega('inp-user')
  let email = pega('inp-email')
  let nasc  = pega('inp-nasc')
  let ok = true

  if (!nome) {
    marcaErro('inp-nome', 'err-nome', 'Informe seu nome de perfil.')
    ok = false
  }

  if (!/^[a-zA-Z0-9_]{4,15}$/.test(user)) {
    marcaErro('inp-user', 'err-user', 'Mínimo 4 caracteres. Apenas letras, números e _.')
    ok = false
  } else if (userJaExiste(user)) {
    marcaErro('inp-user', 'err-user', 'Username já em uso.')
    ok = false
  }

  if (!email || !email.includes('@') || !email.includes('.')) {
    marcaErro('inp-email', 'err-email', 'Informe um e-mail válido.')
    ok = false
  } else if (emailJaExiste(email)) {
    marcaErro('inp-email', 'err-email', 'UC_01_M_01 — E-mail já cadastrado.')
    mostraToast('UC_01_M_01: E-mail já vinculado a outra conta.', true)
    ok = false
  }

  if (nasc) {
    let partes = nasc.split('/')
    if (partes.length === 3) {
      let nasc_date = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`)
      let idade = (Date.now() - nasc_date) / (365.25 * 24 * 3600 * 1000)
      if (isNaN(nasc_date.getTime()) || idade < 13) {
        marcaErro('inp-nasc', 'err-nasc', 'Data inválida ou idade mínima de 13 anos.')
        ok = false
      }
    } else {
      marcaErro('inp-nasc', 'err-nasc', 'Formato: DD/MM/AAAA')
      ok = false
    }
  } else {
    marcaErro('inp-nasc', 'err-nasc', 'Informe sua data de nascimento.')
    ok = false
  }

  if (ok) irPasso('step1', 'step2')
}

function validaPasso2() {
  let senha = document.getElementById('inp-senha').value
  let conf  = document.getElementById('inp-conf').value
  let ok = true

  if (senha.length < 8) {
    marcaErro('inp-senha', 'err-senha', 'Mínimo de 8 caracteres.')
    ok = false
  }
  if (senha !== conf) {
    marcaErro('inp-conf', 'err-conf', 'As senhas não coincidem.')
    ok = false
  }
  if (!ok) return

  let btn = document.querySelector('#step2 .btn')
  btn.disabled = true
  btn.textContent = 'Criando conta…'

  setTimeout(() => {
    let novo_user = {
      nome_perfil:      pega('inp-nome'),
      username:         pega('inp-user'),
      email:            pega('inp-email'),
      tel:              pega('inp-tel') || null,
      data_nasc:        pega('inp-nasc'),
      senha:            btoa(senha),
    }

    insereUsuario(novo_user)

    document.getElementById('label-user').textContent = '@' + novo_user.username
    document.getElementById('log-db').innerHTML =
      `<span>✓</span> criarConta() executado<br>` +
      `<span>✓</span> consultarCadastro(email): false → prosseguiu<br>` +
      `<span>✓</span> salvarUsuario({ nome_perfil: "${novo_user.nome_perfil}", username: "${novo_user.username}", email: "${novo_user.email}", ... })<br>` +
      `<span>✓</span> INSERT → TB_USUARIO (id: ${Date.now() % 100000})<br>` +
      `<span>✓</span> Objeto :Usuario criado`

    irPasso('step2', 'step3')
    mostraToast('Conta criada com sucesso!', false)
    btn.disabled = false
    btn.textContent = 'Continuar'
  }, 1200)
}

function resetaTudo() {
  let campos = ['inp-nome','inp-user','inp-email','inp-tel','inp-nasc','inp-senha','inp-conf','inp-landing']
  campos.forEach(id => {
    let el = document.getElementById(id)
    if (el) {
      el.value = ''
      el.classList.remove('erro')
    }
  })
  document.querySelectorAll('.msg-erro').forEach(e => e.classList.remove('visivel'))
  checaLanding()
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'))
  document.getElementById('step0').classList.add('active')
}

function pega(id) {
  return document.getElementById(id).value.trim()
}

function marcaErro(id_input, id_err, msg) {
  let inp = document.getElementById(id_input)
  inp.classList.add('erro')
  let err = document.getElementById(id_err)
  err.textContent = msg
  err.classList.add('visivel')
}

function limpaMsgErro(el) {
  el.classList.remove('erro')
  let prox = el.parentElement.querySelector('.msg-erro')
  if (prox) prox.classList.remove('visivel')
}

function mascaraData(el) {
  let val = el.value.replace(/\D/g, '')
  if (val.length > 2) val = val.slice(0,2) + '/' + val.slice(2)
  if (val.length > 5) val = val.slice(0,5) + '/' + val.slice(5,9)
  el.value = val
}

function mascaraTel(el) {
  let val = el.value.replace(/\D/g, '')
  let res = ''
  if (val.length > 0) res = '+' + val.slice(0,2)
  if (val.length > 2) res += ' (' + val.slice(2,4)
  if (val.length > 4) res += ') ' + val.slice(4,9)
  if (val.length > 9) res += '-' + val.slice(9,13)
  el.value = res
}

let timer_toast

function mostraToast(msg, eh_erro) {
  let t = document.getElementById('toast')
  t.textContent = msg
  t.className = 'visivel' + (eh_erro ? ' toast-erro' : '')
  clearTimeout(timer_toast)
  timer_toast = setTimeout(() => t.className = '', 3200)
}

document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return
  if (document.getElementById('step1').classList.contains('active')) validaPasso1()
  if (document.getElementById('step2').classList.contains('active')) validaPasso2()
})
