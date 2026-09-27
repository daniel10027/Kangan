/// <reference types="nativewind/types" />

// Filet de sécurité monorepo : selon la façon dont npm hisse les paquets,
// l'augmentation de types fournie par nativewind/react-native-css-interop
// peut cibler une copie de "react-native" différente de celle résolue par
// ce workspace (apps/mobile/node_modules/react-native). On la redéclare
// donc localement pour garantir la présence de `className` quel que soit
// l'algorithme de résolution utilisé.
import "react-native";

declare module "react-native" {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface PressableProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
    contentContainerClassName?: string;
  }
  interface KeyboardAvoidingViewProps {
    className?: string;
  }
  interface ActivityIndicatorProps {
    className?: string;
  }
}
