import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          // Base toast surface
          toast: [
            "group toast",
            // Light mode
            "group-[.toaster]:bg-[#FFFFFF]",
            "group-[.toaster]:text-[#1C2230]",
            "group-[.toaster]:border group-[.toaster]:border-[#D9DEE8]",
            // Dark mode
            "dark:group-[.toaster]:bg-[#1D2330]",
            "dark:group-[.toaster]:text-[#F4F1EA]",
            "dark:group-[.toaster]:border-[#2C3445]",
            // Shadow & glow
            "group-[.toaster]:shadow-[0_4px_24px_rgba(110,142,247,0.08)]",
            "dark:group-[.toaster]:shadow-[0_4px_32px_rgba(125,162,255,0.12)]",
            // Rounded & smooth
            "group-[.toaster]:rounded-xl",
            "group-[.toaster]:backdrop-blur-sm",
          ].join(" "),

          // Description text
          description: [
            "group-[.toast]:text-[#6C7380]",
            "dark:group-[.toast]:text-[#A2AAB8]",
            "group-[.toast]:text-sm",
          ].join(" "),

          // Action button — Cinematic Blue accent
          actionButton: [
            "group-[.toast]:bg-[#6E8EF7] group-[.toast]:text-white",
            "dark:group-[.toast]:bg-[#7DA2FF] dark:group-[.toast]:text-[#0F1117]",
            "group-[.toast]:rounded-lg group-[.toast]:font-medium",
            "group-[.toast]:text-xs group-[.toast]:px-3 group-[.toast]:py-1.5",
            "group-[.toast]:shadow-[0_0_12px_#6E8EF750]",
            "dark:group-[.toast]:shadow-[0_0_12px_#7DA2FF50]",
            "group-[.toast]:transition-all group-[.toast]:duration-200",
            "group-[.toast]:hover:bg-[#5C74D8] dark:group-[.toast]:hover:bg-[#5E7CE2]",
          ].join(" "),

          // Cancel button — muted
          cancelButton: [
            "group-[.toast]:bg-[#EFE9DD] group-[.toast]:text-[#6C7380]",
            "dark:group-[.toast]:bg-[#252C3D] dark:group-[.toast]:text-[#A2AAB8]",
            "group-[.toast]:rounded-lg group-[.toast]:font-medium",
            "group-[.toast]:text-xs group-[.toast]:px-3 group-[.toast]:py-1.5",
            "group-[.toast]:transition-all group-[.toast]:duration-200",
            "group-[.toast]:hover:bg-[#D9DEE8] dark:group-[.toast]:hover:bg-[#2C3445]",
          ].join(" "),

          // Success variant
          success: [
            "group-[.toaster]:border-[#6E9F7A]/40",
            "dark:group-[.toaster]:border-[#89B89A]/30",
            "group-[.toaster]:text-[#6E9F7A]",
            "dark:group-[.toaster]:text-[#89B89A]",
          ].join(" "),

          // Warning variant
          warning: [
            "group-[.toaster]:border-[#C9995D]/40",
            "dark:group-[.toaster]:border-[#D6A86A]/30",
            "group-[.toaster]:text-[#C9995D]",
            "dark:group-[.toaster]:text-[#D6A86A]",
          ].join(" "),

          // Error variant
          error: [
            "group-[.toaster]:border-[#C76B6B]/40",
            "dark:group-[.toaster]:border-[#D67C7C]/30",
            "group-[.toaster]:text-[#C76B6B]",
            "dark:group-[.toaster]:text-[#D67C7C]",
          ].join(" "),

          // Close button
          closeButton: [
            "group-[.toast]:text-[#9AA1AE] group-[.toast]:border-[#D9DEE8]",
            "dark:group-[.toast]:text-[#6F7785] dark:group-[.toast]:border-[#2C3445]",
            "group-[.toast]:hover:text-[#1C2230] group-[.toast]:hover:border-[#6E8EF7]",
            "dark:group-[.toast]:hover:text-[#F4F1EA] dark:group-[.toast]:hover:border-[#7DA2FF]",
            "group-[.toast]:transition-all group-[.toast]:duration-200",
          ].join(" "),

          // Title text
          title: [
            "group-[.toast]:font-semibold group-[.toast]:text-sm",
            "group-[.toast]:text-[#1C2230]",
            "dark:group-[.toast]:text-[#F4F1EA]",
          ].join(" "),
        },
      }}
      {...props}
    />
  );
};

export { Toaster };