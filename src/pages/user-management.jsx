"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import { Search, Edit, Trash2, UserX } from "lucide-react"

export default function UserManagement() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const usersPerPage = 10

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/users?page=${currentPage}&limit=${usersPerPage}&search=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotalPages(Math.ceil(data.total / usersPerPage));
      } else {
        console.error("Error fetching users");
        if (response.status === 401) {
          router.push('/login-admin');
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, usersPerPage]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value)
    setCurrentPage(1)
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setNewPassword("")
    setIsEditModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    setNewPassword("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      const token = localStorage.getItem('adminToken')
      const updatedUser = {
        ...selectedUser,
        newPassword: newPassword || undefined
      }
      const response = await fetch(`/api/users`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedUser),
      })
      if (response.ok) {
        const data = await response.json()
        console.log(data.message)
        await fetchUsers()
        handleCloseModal()
      } else {
        const errorData = await response.json()
        console.error("Error updating user:", errorData.message)
        alert(`Error: ${errorData.message}`)
      }
    } catch (error) {
      console.error("Error updating user:", error)
      alert("An unexpected error occurred. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem('adminToken')
        const response = await fetch(`/api/users?id=${userId}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          await fetchUsers()
        } else {
          console.error("Error deleting user")
        }
      } catch (error) {
        console.error("Error deleting user:", error)
      }
    }
  }

  const handleDeactivate = async (userId) => {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      try {
        const token = localStorage.getItem('adminToken')
        const response = await fetch(`/api/users?id=${userId}`, {
          method: "PATCH",
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          await fetchUsers()
        } else {
          console.error("Error deactivating user")
        }
      } catch (error) {
        console.error("Error deactivating user:", error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 bg-gray-800">
        <nav className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-400">User Management</h1>
          <Button
            onClick={() => router.push("/home-admin")}
            variant="outline"
            className="bg-purple-600 hover:bg-purple-700 text-white border-none"
          >
            Back to Dashboard
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-green-400">Users List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="relative w-64">
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 bg-gray-700 text-white border-gray-600"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-green-400">Name</TableHead>
                  <TableHead className="text-green-400">Email</TableHead>
                  <TableHead className="text-green-400">Status</TableHead>
                  <TableHead className="text-green-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id.toString()}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.accountStatus}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEdit(user)}
                          size="sm"
                          variant="outline"
                          className="bg-blue-500 hover:bg-blue-600 text-white border-none"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeactivate(user._id)}
                          size="sm"
                          variant="outline"
                          className="bg-yellow-500 hover:bg-yellow-600 text-white border-none"
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(user._id)}
                          size="sm"
                          variant="outline"
                          className="bg-red-500 hover:bg-red-600 text-white border-none"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {users.length > 0 && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isEditModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-green-400">Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={selectedUser.name}
                    onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Account Status</Label>
                  <Select
                    value={selectedUser.accountStatus}
                    onValueChange={(value) => setSelectedUser({...selectedUser, accountStatus: value})}
                  >
                    <SelectTrigger className="bg-gray-700 text-white border-gray-600">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password (leave blank to keep current)</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </div>
                <Button type="submit" className="w-full bg-green-500 hover:bg-green-600" disabled={isUpdating}>
                  {isUpdating ? 'Updating...' : 'Update User'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}