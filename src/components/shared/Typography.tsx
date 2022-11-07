import { MouseEventHandler, useMemo } from 'react';
import styled from 'styled-components';

import { useAppSelector } from '~/store';
import { getTheme } from './theme';
import { FONT_SIZE_20, FONT_SIZE_16, FONT_SIZE_12, FONT_SIZE_24 } from './Variables';

interface BaseProps {
  allowWrap?: boolean;
  color?: string;
}
const BaseComponent = styled.div<BaseProps>`
  color: ${(props) => props.color};
  display: inline-block;
  font-family: PlusJakartaSans;
  font-weight: 600;
  line-height: 1.25em;
  white-space: ${({ allowWrap }) => (allowWrap ? 'normal' : 'nowrap')};
`;

const XLarge = styled(BaseComponent)`
  font-size: ${FONT_SIZE_24};
`;

const Large = styled(BaseComponent)`
  font-size: ${FONT_SIZE_20};
`;

const Medium = styled(BaseComponent)`
  font-size: ${FONT_SIZE_16};
`;

const Small = styled(BaseComponent)`
  font-size: ${FONT_SIZE_12};
`;

export type TypographyVariant = 'x-large' | 'large' | 'medium' | 'small';

interface Props {
  allowWrap?: boolean;
  children?: any;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  variant?: TypographyVariant;
  color?: 'primary' | 'secondary' | 'disabled' | 'background';
}
export const Typography = ({ allowWrap, children, variant, color, ...otherProps }: Props) => {
  const Component = useMemo(() => {
    switch (variant) {
      case 'x-large':
        return XLarge;
      case 'large':
        return Large;
      case 'medium':
        return Medium;
      case 'small':
        return Small;
      default:
        return Medium;
    }
  }, [variant]);

  const currentTheme = useAppSelector(({ theme }) => theme.current);
  const theme = getTheme(currentTheme);

  const _color = useMemo(() => {
    switch (color) {
      case 'background':
        return theme.background;
      case 'disabled':
        return theme.textDisabled;
      case 'primary':
        return theme.textPrimary;
      case 'secondary':
        return theme.textSecondary;
      default:
        return theme.textPrimary;
    }
  }, [color, theme]);

  return (
    <Component allowWrap={allowWrap} color={_color} {...otherProps}>
      {children}
    </Component>
  );
};
