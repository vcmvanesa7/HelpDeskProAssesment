"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Chip,
  CircularProgress,
} from "@mui/material";

import { getAllUsers } from "@/services/user.service";
import type { IUser } from "@/schemas/user.schema";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");

  // Load users
  useEffect(() => {
    async function load() {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // Filtered list
  const filtered = useMemo(() => {
    return users
      .filter((u) =>
        search.trim()
          ? u.email.toLowerCase().includes(search.toLowerCase()) ||
            (u.name ?? "").toLowerCase().includes(search.toLowerCase())
          : true
      )
      .filter((u) => (role === "all" ? true : u.role === role));
  }, [users, search, role]);

  if (loading)
    return (
      <Box p={8} textAlign="center">
        <CircularProgress size={40} />
      </Box>
    );

  return (
    <Box p={5}>
      <Typography variant="h4" fontWeight={800} mb={4}>
        Users Management
      </Typography>

      {/* Filters */}
      <Box display="flex" gap={3} mb={4} flexWrap="wrap">
        <TextField
          label="Search user..."
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />

        <FormControl sx={{ width: 200 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={role}
            label="Role"
            onChange={(e) => setRole(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="client">Client</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="support">Support</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u._id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar src={u.image?.url ?? undefined} />
                    {u.name || "No name"}
                  </Box>
                </TableCell>

                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Chip
                    label={u.provider}
                    color={u.provider === "google" ? "info" : "default"}
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label={u.role}
                    color={
                      u.role === "admin"
                        ? "warning"
                        : u.role === "support"
                        ? "info"
                        : "default"
                    }
                    sx={{ textTransform: "capitalize" }}
                  />
                </TableCell>

                <TableCell>
                  {new Date(u.createdAt!).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
