import { Services } from "./services.js";

class Core {
  constructor(app) {
    this.onAddButton();

    this.app = document.getElementById(app);
    this.table = this.app.querySelector("tbody");

    this.refresh();
  }

  loadDB() {
    this.DB = JSON.parse(localStorage.getItem("@git-users")) ?? [];
  }

  async addUser() {
    const input = document.querySelector("#search-wrapper input");
    const repeatedUser = this.DB.find((user) => user.login == input.value);

    if (repeatedUser) {
      return alert("Usuário já nos favoritos");
    }

    try {
      const gitUser = await Services.fetchGitUser(input.value);

      if (gitUser.login == undefined) {
        throw new Error("Usuário não encontrado");
      }

      this.saveOnDB(gitUser);
    } catch (error) {
      alert(error.message);
      return;
    }

    input.value = "";
  }

  saveOnDB(gitUser) {
    this.DB = [gitUser, ...this.DB];
    localStorage.setItem("@git-users", JSON.stringify(this.DB));
    this.refresh();
  }

  delete(userRemoved) {
    const deleteConfirm = confirm(
      `Tem certeza que deseja deletar ${
        userRemoved.name ?? userRemoved.login
      } ?`
    );

    if (!deleteConfirm) {
      return;
    }

    this.DB = this.DB.filter((user) => user.login != userRemoved.login);
    localStorage.setItem("@git-users", JSON.stringify(this.DB));
    this.refresh();
  }
}

export class Visualizer extends Core {
  constructor(app) {
    super(app);
  }

  cleanTable() {
    this.table.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }

  newRow() {
    const tr = document.createElement("tr");

    if (this.DB.length < 1) {
      tr.innerHTML = `
      <td>
        <img src="./assets/big-star.svg" alt="" />
        <h1>Nenhum favorito ainda</h1>
      </td>
      `;
      tr.classList.add("alert");
      this.table.append(tr);
      return;
    }

    tr.innerHTML = `
      <td class="profile">
        <a href="/">
          <img
            src="https://source.unsplash.com/56x56/?profile"
            alt="Imagem de perfil do usuário"
          />
          <div class="profile-info">
            <p>Usuario</p>
            <span>login</span>
          </div>
        </a>

        <td class="repositories">123</td>

        <td class="followers">700</td>

        <td class="remove">
          <button type="button">Remover</button>
        </td>
      </td>
      `;

    return tr;
  }

  refresh() {
    this.loadDB();
    this.cleanTable();

    if (this.DB.length == []) {
      this.app.querySelector("main").classList.add("empty");
      this.newRow();
      return;
    }

    this.app.querySelector("main").classList.remove("empty");

    this.DB.forEach((user) => {
      const tr = this.newRow();
      tr.querySelector(".profile-info p").innerHTML = user.name;
      tr.querySelector(".profile-info span").innerHTML = user.login;
      tr.querySelector(".repositories").innerHTML = user.public_repos;
      tr.querySelector(".followers").innerHTML = user.followers;
      tr.querySelector(".profile img").alt = `Imagem de perfil de ${user.name}`;
      tr.querySelector(
        ".profile img"
      ).src = `https://github.com/${user.login}.png?size=50`;

      tr.querySelector(".remove button").addEventListener("click", () =>
        this.delete(user)
      );

      this.table.append(tr);
    });
  }

  onAddButton() {
    document
      .querySelector("#search-wrapper button")
      .addEventListener("click", () => this.addUser());
  }
}
