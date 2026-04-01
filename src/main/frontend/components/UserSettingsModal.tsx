import { useEffect, useState } from 'react';
import { UserEndpoint } from 'Frontend/generated/endpoints';
import UserDto from 'Frontend/generated/io/github/dutianze/yotsuba/shared/security/UserDto';
import { useAuth } from 'Frontend/utils/auth';
import { ChevronDownIcon, CloseIcon, EditIcon, LogoutIcon } from './ui/Icons';

interface Props {
  open: boolean;
  onClose: () => void;
}

const byteArrayToDataUrl = (bytes?: number[]) => {
  if (!bytes || bytes.length === 0) return undefined;
  const binary = bytes.reduce((str, n) => str + String.fromCharCode((n + 256) % 256), '');
  return `data:image;base64,${btoa(binary)}`;
};

export default function UserSettingsModal({ open, onClose }: Props) {
  const { logout } = useAuth();
  const [user, setUser] = useState<UserDto | null>(null);
  const [name, setName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | undefined>();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const isNameChanged = name.trim() !== originalName.trim();
  const isPasswordValid = Boolean(oldPassword.trim() && newPassword.trim());

  const handleLogout = async () => {
    await logout();
    onClose();
    document.location.reload();
  };

  useEffect(() => {
    if (!open) {
      setName('');
      setOriginalName('');
      setOldPassword('');
      setNewPassword('');
      setPasswordOpen(false);
      return;
    }

    UserEndpoint.getAuthenticatedUser().then((u) => {
      if (!u) return;
      const userName = u.name ?? '';
      setUser(u);
      setName(userName);
      setOriginalName(userName);
      setProfilePicture(byteArrayToDataUrl(u.profilePicture as number[]));
    });
  }, [open]);

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setProfilePicture(reader.result as string);
    reader.readAsDataURL(file);

    const updated = await UserEndpoint.updateProfilePicture(file);
    if (updated) {
      setUser(updated);
      setProfilePicture(byteArrayToDataUrl(updated.profilePicture as number[]));
    }
  };

  const saveName = async () => {
    if (!name.trim() || !isNameChanged) return;
    const updated = await UserEndpoint.updateName(name.trim());
    if (updated) {
      setUser(updated);
      setOriginalName(updated.name ?? '');
    }
  };

  const savePassword = async () => {
    if (!isPasswordValid) return;
    await UserEndpoint.changePassword(oldPassword, newPassword);
    alert('密码修改成功');
    setOldPassword('');
    setNewPassword('');
  };

  if (!open) return null;

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        className="fixed inset-0 z-[3999] bg-neutral/35 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="fixed left-1/2 top-1/2 z-[4000] w-[min(380px,90vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[22px] border border-white/35 bg-white/25 p-6 text-base-content shadow-2xl backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="pointer-events-none absolute inset-[-50%] opacity-90 blur-3xl">
          <div className="h-full w-full animate-[liquidMove_7s_linear_infinite] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.25),transparent_60%)]" />
        </div>

        <div className="relative">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold">用户设置</h2>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <div className="relative h-32 w-32">
              <img
                src={profilePicture}
                alt={user?.name ?? 'profile'}
                className="h-full w-full rounded-full object-cover shadow-xl"
              />
              <label className="btn btn-circle btn-sm absolute -bottom-1 -right-1 border-white/60 bg-white/45 text-base-content shadow-md backdrop-blur hover:bg-white/65">
                <EditIcon className="h-4 w-4" />
                <input hidden accept="image/*" type="file" onChange={onAvatarChange} />
              </label>
            </div>

            <div className="min-w-0">
              <div className="truncate font-semibold">{user?.name}</div>
              <div className="truncate text-sm text-base-content/70">{user?.username}</div>
            </div>
          </div>

          <div className="mb-2 text-xs uppercase tracking-[0.2em] text-base-content/55">基本信息</div>

          <input
            className="input input-bordered mb-3 w-full border-white/45 bg-white/70"
            placeholder="显示名字"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            type="button"
            onClick={saveName}
            disabled={!isNameChanged || !name.trim()}
            className="btn mb-6 w-full rounded-2xl border-white/25 bg-white/25 text-base-content shadow-sm backdrop-blur disabled:border-white/10 disabled:bg-white/10 disabled:text-base-content/40 hover:bg-white/40">
            保存修改
          </button>

          <div className="divider my-0 opacity-50" />

          <button
            type="button"
            onClick={() => setPasswordOpen((v) => !v)}
            className="flex w-full items-center justify-between py-3 text-left font-semibold">
            <span>修改密码</span>
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${passwordOpen ? 'rotate-180' : ''}`} />
          </button>

          {passwordOpen && (
            <div className="pb-2">
              <input
                type="password"
                className="input input-bordered mb-3 w-full border-white/45 bg-white/70"
                placeholder="旧密码"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />

              <input
                type="password"
                className="input input-bordered mb-4 w-full border-white/45 bg-white/70"
                placeholder="新密码"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isPasswordValid) {
                    savePassword();
                  }
                }}
              />

              <button
                type="button"
                onClick={savePassword}
                disabled={!isPasswordValid}
                className="btn w-full rounded-2xl border-white/25 bg-white/25 text-base-content shadow-sm backdrop-blur disabled:border-white/10 disabled:bg-white/10 disabled:text-base-content/40 hover:bg-white/40">
                更新密码
              </button>
            </div>
          )}

          <div className="divider my-0 opacity-50" />

          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-outline btn-error mt-4 w-full rounded-full">
            <LogoutIcon className="h-4 w-4" />
            退出登录
          </button>
        </div>
      </div>

      <style>{`
        @keyframes liquidMove {
          0% { transform: rotate(0deg) translate(0, 0); }
          50% { transform: rotate(180deg) translate(80px, 40px); }
          100% { transform: rotate(360deg) translate(0, 0); }
        }
      `}</style>
    </>
  );
}
