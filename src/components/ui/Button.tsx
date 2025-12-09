import Button from "@mui/material/Button";

export const PrimaryButton = ({ children, ...props }: any) => (
  <Button
    {...props}
    variant="contained"
    sx={{
      borderRadius: "999px",
      backgroundColor: "#111827",
      textTransform: "none",
      fontWeight: 600,
      "&:hover": { backgroundColor: "#020617" },
    }}
  >
    {children}
  </Button>
);
