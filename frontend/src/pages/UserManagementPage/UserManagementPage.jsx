import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Card from "../../components/Card/Card";
import styles from "./UserManagementPage.module.css";

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "TECNICO",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/auth/users");
      setUsers(response.data);
    } catch (err) {
      setError("Falha ao buscar usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      await api.post("/auth/register", formData);
      setFormSuccess(`Usuário ${formData.name} criado com sucesso!`);
      // Limpa o formulário
      setFormData({ name: "", email: "", password: "", role: "TECNICO" });
      // Atualiza a lista de usuários
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || "Erro ao criar usuário.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p>Carregando usuários...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <h1>Gerenciamento de Usuários</h1>

      <Card title="Criar Novo Usuário">
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Nome Completo</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="role">Perfil</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="TECNICO">Técnico</option>
                <option value="LIDER">Líder</option>
                <option value="PMS">PMS</option>
                <option value="ESTAGIARIO">Estagiário</option>
                <option value="PMM">PMM</option>
              </select>
            </div>
          </div>
          {formError && <p className={styles.formMessageError}>{formError}</p>}
          {formSuccess && (
            <p className={styles.formMessageSuccess}>{formSuccess}</p>
          )}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Criando..." : "Criar Usuário"}
          </button>
        </form>
      </Card>

      <div className={styles.userList}>
        <Card title="Usuários Cadastrados">
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Perfil</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td data-label="Nome">{user.name}</td>
                  <td data-label="Email">{user.email}</td>
                  <td data-label="Perfil">{user.role}</td>
                  <td data-label="Ações">
                    <div className={styles.actionButtons}>
                      <Link
                        to={`/gerenciar-usuarios/${user.id}/linhas`}
                        className={styles.manageButton}
                      >
                        Gerenciar Linhas
                      </Link>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className={styles.deleteButton}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

export default UserManagementPage;
