import React, {
  type ButtonHTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import { Link, type LinkProps } from "react-router-dom";

type DropDownButtonButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onClick"
>;

interface DropDownButtonBaseProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
  to?: LinkProps["to"];
}

type DropDownButtonProps = DropDownButtonBaseProps &
  DropDownButtonButtonProps &
  Pick<LinkProps, "replace" | "state" | "preventScrollReset" | "relative">;

const dropdownButtonClassName = [
  "flex w-full items-center justify-between gap-3 rounded-sm px-2.5 py-2",
  "text-left font-pixel text-[8px] leading-4 text-pixel-ink transition",
  "hover:bg-pixel-highlight/15 focus-visible:outline",
  "focus-visible:outline-2 focus-visible:outline-pixel-highlight",
  "disabled:cursor-not-allowed disabled:opacity-60",
].join(" ");

const DropDownButton: React.FC<DropDownButtonProps> = ({
  children,
  className = "",
  icon,
  onClick,
  to,
  type = "button",
  replace,
  state,
  preventScrollReset,
  relative,
  ...buttonProps
}) => {
  const content = (
    <>
      <span>{children}</span>
      {icon ? (
        <span className="grid shrink-0 place-items-center">{icon}</span>
      ) : null}
    </>
  );

  if (to) {
    return (
      <Link
        className={`${dropdownButtonClassName} ${className}`}
        role="menuitem"
        to={to}
        replace={replace}
        state={state}
        preventScrollReset={preventScrollReset}
        relative={relative}
        onClick={onClick as MouseEventHandler<HTMLAnchorElement>}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={`${dropdownButtonClassName} ${className}`}
      type={type}
      role="menuitem"
      onClick={onClick as MouseEventHandler<HTMLButtonElement>}
      {...buttonProps}>
      {content}
    </button>
  );
};

export default DropDownButton;
