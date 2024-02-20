import { useState, useEffect } from "react";

import { signOut } from "firebase/auth";
import {
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "../../firebaseConnection";

import "./admin.css";

const Admin = () => {
  const [user, setUser] = useState({});
  const [tarefaInput, setTarefaInput] = useState("");
  const [tarefas, setTarefas] = useState([]);
  const [edit, setEdit] = useState({});

  useEffect(() => {
    async function loadTarefas() {
      const userDetail = localStorage.getItem("@detailUser");
      setUser(JSON.parse(userDetail));

      if (userDetail) {
        const data = JSON.parse(userDetail);

        const q = query(
          collection(db, "tarefas"),
          where("userUid", "==", data.uid),
          orderBy("created", "desc")
        );

        onSnapshot(q, (snapshot) => {
          let lista = [];

          snapshot.forEach((doc) => {
            lista.push({
              id: doc.id,
              tarefa: doc.data().tarefa,
              userUid: doc.data().userUid,
            });
          });

          console.log(lista);
          setTarefas(lista);
        });
      }
    }

    loadTarefas();
  }, []);

  async function handleRegister(e) {
    e.preventDefault();

    if (edit?.id) {
      handleUpdateTarefa();
      return;
    }

    if (tarefaInput === "") {
      alert("Digite sua tarefa...");
      return;
    }

    await addDoc(collection(db, "tarefas"), {
      tarefa: tarefaInput,
      created: new Date(),
      userUid: user?.uid,
    })
      .then(() => {
        console.log("TAREFA REGISTRADA");
        setTarefaInput("");
      })
      .catch((error) => {
        console.log("ERRO AO REGISTRAR " + error);
      });
  }

  async function handleLogout() {
    await signOut(auth);
  }

  async function deleteTarefa(id) {
    await deleteDoc(doc(db, "tarefas", id));
  }

  function editTarefa(item) {
    setTarefaInput(item.tarefa);
    setEdit(item);
  }

  async function handleUpdateTarefa() {
    await updateDoc(doc(db, "tarefas", edit?.id), {
      tarefa: tarefaInput,
    })
      .then(() => {
        console.log("TAREFA ATUALIZADA");
        setTarefaInput("");
        setEdit({});
      })
      .catch(() => {
        console.log("ERRO AO ATUALIZAR");
        setTarefaInput("");
        setEdit({});
      });
  }

  return (
    <div className="admin-container">
      <h1>Minhas tarefas</h1>

      <form className="form" onSubmit={handleRegister}>
        <textarea
          placeholder="Digite sua tarefa..."
          value={tarefaInput}
          onChange={(e) => setTarefaInput(e.target.value)}
        />

        {Object.keys(edit).length > 0 ? (
          <button className="btn-register" type="submit">
            Atualizar tarefa
          </button>
        ) : (
          <button className="btn-register" type="submit">
            Registrar tarefa
          </button>
        )}
      </form>

      {tarefas.map((item) => (
        <article key={item.id} className="list">
          <p>{item.tarefa}</p>

          <div>
            <button onClick={() => editTarefa(item)}>Editar</button>
            <button
              onClick={() => deleteTarefa(item.id)}
              className="btn-delete"
            >
              Concluir
            </button>
          </div>
        </article>
      ))}

      <button className="btn-logout" onClick={handleLogout}>
        Sair
      </button>
    </div>
  );
};

export default Admin;
