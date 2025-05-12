import { Container, Typography, Grid, Card, CardContent } from "@mui/material";
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper
} from "@mui/material";
import React, { useState, useEffect } from "react";


function AdminPanel() {
    const [stats, setStats] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);
    const [registrations, setRegistrations] = useState([]);

    useEffect(() => {
        fetch("https://localhost:7253/api/admin/overview")
            .then((res) => res.json())
            .then((data) => setStats(data))
            .catch((err) => console.error("Eroare la fetch admin stats:", err));
    }, []);

    useEffect(() => {
        fetch("https://localhost:7253/api/admin/recent-users")
            .then((res) => res.json())
            .then((data) => setRecentUsers(data))
            .catch((err) => console.error("Eroare la fetch utilizatori recenti:", err));
    }, []);
    useEffect(() => {
      fetch("https://localhost:7253/api/admin/registrations-last-7-days")
        .then((res) => res.json())
        .then((data) => setRegistrations(data))
        .catch((err) => console.error("Eroare la fetch utilizatori pe zile:", err));
    }, []);


    const cardData = [
        { label: "Utilizatori înregistrați", value: stats?.totalUsers ?? "-" },
        { label: "Canale create", value: stats?.totalChannels ?? "-" },
        { label: "Recomandări trimise", value: stats?.totalRecommendations ?? "-" }
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 5 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard Administrator
            </Typography>
            <Typography variant="body1" gutterBottom>
                Bine ai venit! Aici poți vedea statistici și gestiona platforma.
            </Typography>

            <Grid container spacing={3} sx={{ mt: 3 }}>
                {cardData.map((stat, idx) => (
                    <Grid item xs={12} sm={6} md={3} key={idx}>
                        <Card
                            sx={{
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                py: 4,
                                minHeight: 160,
                            }}
                        >
                            <CardContent>
                                <Typography variant="h6" align="center">{stat.label}</Typography>
                                <Typography variant="h4" color="primary" align="center">
                                    {stat.value}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>


            <Typography variant="h5" sx={{ mt: 5, mb: 2 }}>
                Utilizatori recenți
            </Typography>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Username</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Creat la</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.userName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>


            <Typography variant="h5" sx={{ mt: 5, mb: 2 }}>
              Înregistrări utilizatori (7 zile)
            </Typography>

           <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "10px", height: 200 }}>
              {registrations.map((entry) => (
                <div
                  key={entry.date}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    width: 40
                  }}
                >
                  <div style={{ fontSize: 12, color: "#fff", marginBottom: 4 }}>{entry.count}</div>
                  <div style={{
                    height: `${entry.count > 0 ? entry.count * 40 : 4}px`,
                    backgroundColor: "#90caf9",
                    width: "100%",
                    borderRadius: 4
                  }} />
                  <div style={{ fontSize: 12, color: "#ccc", marginTop: 4 }}>{entry.date.slice(5)}</div>
                </div>
              ))}
            </div>





        </Container>
    );
}

export default AdminPanel;
