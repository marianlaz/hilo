#!/bin/sh
# Instala Hilo en esta Mac: una carpeta, y adentro todo.
#   curl -fsSL https://raw.githubusercontent.com/marianlaz/hilo/main/install.sh | sh
# La casa queda en ~/Desktop/hilo (o en $HILO_CASA). Para arrancarlo después: hilo
set -e
REPO="https://github.com/marianlaz/hilo.git"
CASA="${HILO_CASA:-$HOME/Desktop/hilo}"

leer() { printf '> '; IFS= read -r R < /dev/tty; printf '%s' "$R"; }
esc() { printf '%s' "$1" | sed 's/["\\]/\\&/g'; }

echo
echo "Hola, soy Hilo. ¿Vos?"
PERSONA=$(leer)
echo "¿Cómo querés llamarme? (enter: Hilo)"
PERSONAJE=$(leer); PERSONAJE=${PERSONAJE:-Hilo}

if ! command -v claude >/dev/null 2>&1; then
  echo "Necesito Claude Code. ¿Lo instalo con el instalador oficial de claude.ai? [s/N]"
  case "$(leer)" in
    s|S|si|sí|y|Y) curl -fsSL https://claude.ai/install.sh | bash; export PATH="$HOME/.local/bin:$PATH" ;;
    *) echo "Sin Claude Code no arranco. Instalalo y volvé a correr esto."; exit 1 ;;
  esac
fi
command -v git >/dev/null 2>&1 || { echo "Necesito git. En macOS: xcode-select --install"; exit 1; }

if [ -d "$CASA/plugins/hilo" ]; then
  echo "Ya hay una casa en $CASA. La uso."
else
  git clone --quiet "$REPO" "$CASA"
fi
[ -f "$CASA/ficha.json" ] || printf '{\n  "persona": "%s",\n  "personaje": "%s",\n  "primeraVez": true,\n  "creada": "%s"\n}\n' \
  "$(esc "$PERSONA")" "$(esc "$PERSONAJE")" "$(date +%F)" > "$CASA/ficha.json"

# el atajo: escribir "hilo" desde cualquier carpeta
mkdir -p "$HOME/.local/bin"
printf '#!/bin/sh\nexec "%s/bin/hilo" "$@"\n' "$CASA" > "$HOME/.local/bin/hilo"
chmod +x "$HOME/.local/bin/hilo" "$CASA/bin/hilo"
case ":$PATH:" in *":$HOME/.local/bin:"*) ;; *) echo "Para escribir 'hilo' desde cualquier lado, sumá ~/.local/bin a tu PATH." ;; esac

echo
echo "Listo${PERSONA:+, $PERSONA}. Tu casa es $CASA. La primera vez Claude pide iniciar sesión. Arranco."
exec "$CASA/bin/hilo"
