export class Services {
  static fetchGitUser(username) {
    const api = `https://api.github.com/users/${username}`;

    return fetch(api)
      .then((res) => res.json())
      .then(({ name, login, public_repos, followers }) => ({
        name,
        login,
        public_repos,
        followers,
      }));
  }
}
