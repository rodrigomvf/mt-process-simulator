export const metadata = {
  title: "MT Process Simulator",
  description: "Mineral Technologies - Simulador de Linha de Produção",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
