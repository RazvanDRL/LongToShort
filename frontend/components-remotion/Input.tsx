import React, { useCallback } from "react";

const textarea: React.CSSProperties = {
  resize: "none",
  lineHeight: 1.7,
  display: "block",
  width: "100%",
  borderRadius: "var(--geist-border-radius)",
  backgroundColor: "var(--background)",
  padding: "var(--geist-half-pad)",
  color: "var(--foreground)",
  fontSize: 14,
};

type Font = {
  textColor: string;
  fontSize: number;
  fontFamily: string;
  fontName: string;
  fontWeight: number;
  verticalPosition: number;
  uppercase: boolean;
  punctuation: boolean;
  stroke: {
    strokeWidth: string,
    strokeColor: string,
  };
  shadow: string;
}


export const Input: React.FC<{
  font: Font;
  setFont: React.Dispatch<React.SetStateAction<Font>>;
  disabled?: boolean;
}> = ({ font, setFont, disabled }) => {
  const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      setFont((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    },
    [setFont]
  );

  return (
    <input
      disabled={disabled}
      name="title"
      style={textarea}
      onChange={onChange}
    />
  );
};
