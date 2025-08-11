import { Typography, TypographyVariant } from "@/constants/typography";
import React from "react";
import {
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
} from "react-native";

interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: string;
}

export function Text({ variant = "body", style, color, ...props }: TextProps) {
  const typographyStyle = Typography[variant];

  const textStyle: TextStyle = {
    ...typographyStyle,
    ...(color && { color }),
    ...(Array.isArray(style) ? Object.assign({}, ...style) : style),
  };

  return <RNText style={textStyle} {...props} />;
}

export default Text;
