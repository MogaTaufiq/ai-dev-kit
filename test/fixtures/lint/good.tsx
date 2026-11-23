const sizes = ["sm", "md"] as const;
export const Card = () => (
  <div className="text-muted p-4 data-[state=open]:bg-accent has-[>svg]:size-4">
    <a href="#feed">{sizes.join(",")}</a>
  </div>
);
