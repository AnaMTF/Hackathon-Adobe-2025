import "./globals.css";
import Header from "./components/header";
import { AuthProvider } from "./contexts/AuthContext";
import UserStatusProvider from "./components/UserStatusProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <UserStatusProvider>
            <Header />
            {children}
          </UserStatusProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
