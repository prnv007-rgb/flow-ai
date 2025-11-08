
// components/OverviewCard.tsx
type OverviewCardProps = {
  title: string;
  value: string | number;
};

export default function OverviewCard({ title, value }: OverviewCardProps) {
  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        minWidth: 180,
        margin: "8px",
        textAlign: "center",
      }}
    >
      <h3 style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>{title}</h3>
      <p style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>{value}</p>
    </div>
  );
}
