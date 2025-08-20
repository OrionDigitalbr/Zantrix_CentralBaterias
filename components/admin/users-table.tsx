"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Edit, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { getUsers, deleteUser } from "@/lib/db"
import type { User } from "@/lib/supabase"

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<number | null>(null)

  // Buscar usuários do banco de dados
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true)
        const data = await getUsers()
        setUsers(data)
      } catch (err) {
        console.error("Erro ao buscar usuários:", err)
        setError("Falha ao carregar usuários. Por favor, tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Filtrar usuários por pesquisa
  const filteredUsers = users.filter((user) => {
    return (
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Paginação
  const usersPerPage = 5
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage)

  const confirmDelete = (id: number) => {
    setUserToDelete(id)
    setShowDeleteModal(true)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      await deleteUser(userToDelete)
      setUsers(users.filter((user) => user.id !== userToDelete))
      setShowDeleteModal(false)
      setUserToDelete(null)
    } catch (err) {
      console.error("Erro ao excluir usuário:", err)
      setError("Falha ao excluir usuário. Por favor, tente novamente.")
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setUserToDelete(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar usuários por nome ou email..."
              className="w-full bg-background border border-input rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-muted/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
                >
                  Nome
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
                >
                  Função
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">{user.role_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/users/edit/${user.id}`}
                          className="text-blue-500 hover:text-blue-700 transition-colors duration-200 transform hover:scale-110"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          className="text-red-500 hover:text-red-700 transition-colors duration-200 transform hover:scale-110"
                          onClick={() => confirmDelete(user.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-foreground">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredUsers.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-foreground">
              Mostrando <span className="font-medium">{(currentPage - 1) * usersPerPage + 1}</span> a{" "}
              <span className="font-medium">{Math.min(currentPage * usersPerPage, filteredUsers.length)}</span> de{" "}
              <span className="font-medium">{filteredUsers.length}</span> resultados
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md transition-all duration-200 ${
                  currentPage === 1
                    ? "bg-muted text-foreground/50 cursor-not-allowed"
                    : "bg-muted text-foreground hover:bg-muted/80 hover:scale-105"
                }`}
              >
                <ChevronLeft size={18} />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-md transition-all duration-200 ${
                    currentPage === i + 1
                      ? "bg-primary text-primary-foreground transform scale-105"
                      : "bg-muted text-foreground hover:bg-muted/80 hover:scale-105"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md transition-all duration-200 ${
                  currentPage === totalPages
                    ? "bg-muted text-foreground/50 cursor-not-allowed"
                    : "bg-muted text-foreground hover:bg-muted/80 hover:scale-105"
                }`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeInBackdrop">
          <div className="bg-white rounded-lg p-6 max-w-md w-full animate-modalFadeIn">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-200 hover:scale-105"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
