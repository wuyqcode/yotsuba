import { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Button, TextField, Divider, Collapse, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';

import { UserEndpoint } from 'Frontend/generated/endpoints';
import UserDto from 'Frontend/generated/io/github/dutianze/yotsuba/shared/security/UserDto';
import { useAuth } from 'Frontend/utils/auth';

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

  // 检查名称是否有修改
  const isNameChanged = name.trim() !== originalName.trim();
  // 检查密码是否已输入
  const isPasswordValid = oldPassword.trim() && newPassword.trim();

  const handleLogout = async () => {
    await logout();
    onClose();
    document.location.reload();
  };

  // 加载用户信息
  useEffect(() => {
    if (!open) {
      // 关闭模态框时重置状态
      setName('');
      setOriginalName('');
      setOldPassword('');
      setNewPassword('');
      setPasswordOpen(false);
      return;
    }

    UserEndpoint.getAuthenticatedUser().then((u) => {
      if (!u) return;
      setUser(u);
      const userName = u.name ?? '';
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
    if (!oldPassword.trim() || !newPassword.trim() || !isPasswordValid) return;
    await UserEndpoint.changePassword(oldPassword, newPassword);
    alert('密码修改成功');
    setOldPassword('');
    setNewPassword('');
  };

  if (!open) return null;

  return (
    <>
      {/* —— 透明遮罩 —— */}
      <Box
        onClick={onClose}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 3999,
          background: 'rgba(46, 44, 44, 0.4)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* —— 液态玻璃主体 —— */}
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) scale(1)',
          width: 380,
          maxWidth: '90vw',
          borderRadius: '22px',
          p: 3,
          zIndex: 4000,

          // 🎨 Liquid Glass 基础层
          background: 'rgba(255,255,255,0.22)',
          backdropFilter: 'blur(22px) saturate(180%)',
          WebkitBackdropFilter: 'blur(22px) saturate(180%)',

          // 🎨 高光玻璃边框（顶级质感）
          border: '1px solid rgba(255,255,255,0.35)',
          boxShadow: `0 0 0 1px rgba(255,255,255,0.2) inset,
             0 20px 40px rgba(0,0,0,0.35)`,

          // 🎨 Liquid Shine 动画光斑（最关键的 A 级效果）
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.25), transparent 60%)',
            animation: 'liquidMove 7s infinite linear',
            pointerEvents: 'none',
            filter: 'blur(40px)',
            opacity: 0.9,
          },

          animation: 'modalPop 0.28s cubic-bezier(0.22,0.61,0.36,1)',
        }}>
        {/* —— 顶部栏 —— */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography fontWeight={700} fontSize="1.05rem">
            用户设置
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* —— 用户卡片 —— */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{ position: 'relative', width: 128, height: 128 }}>
            <Avatar
              src={profilePicture}
              sx={{
                width: '100%',
                height: '100%',
                boxShadow: '0 14px 26px rgba(0,0,0,0.25)',
              }}
            />

            {/* 悬浮编辑按钮 */}
            <Button
              component="label"
              sx={{
                position: 'absolute',
                bottom: -6,
                right: -6,
                minWidth: 0,
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.35)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.5)',
                p: 0,
                cursor: 'pointer',
                '&:hover': {
                  background: 'rgba(255,255,255,0.45)',
                },
              }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>✎</Typography>
              <input hidden accept="image/*" type="file" onChange={onAvatarChange} />
            </Button>
          </Box>

          <Box>
            <Typography fontWeight={600}>{user?.name}</Typography>
            <Typography sx={{ fontSize: '0.8rem', opacity: 0.75 }}>{user?.username}</Typography>
          </Box>
        </Box>

        {/* —— 基本信息 —— */}
        <Typography
          sx={{
            fontSize: '0.8rem',
            opacity: 0.6,
            mb: 1,
          }}>
          基本信息
        </Typography>

        <TextField
          label="显示名字"
          size="small"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 1.5 }}
        />

        <Button
          fullWidth
          onClick={saveName}
          disabled={!isNameChanged || !name.trim()}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            py: 1.2,
            mb: 3,
            background: isNameChanged && name.trim()
              ? 'rgba(255,255,255,0.15)'
              : 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: isNameChanged && name.trim()
              ? '1px solid rgba(255,255,255,0.25)'
              : '1px solid rgba(255,255,255,0.1)',
            color: isNameChanged && name.trim()
              ? 'rgba(0,0,0,0.85)'
              : 'rgba(0,0,0,0.4)',
            boxShadow: isNameChanged && name.trim()
              ? '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)'
              : 'none',
            transition: 'all 0.3s ease',
            '&:hover:not(:disabled)': {
              background: 'rgba(255,255,255,0.2)',
              borderColor: 'rgba(255,255,255,0.35)',
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
            },
            '&:disabled': {
              cursor: 'not-allowed',
            },
          }}>
          保存修改
        </Button>

        <Divider sx={{ opacity: 0.5, mb: 2 }} />

        {/* —— 修改密码（折叠） —— */}
        <Box
          onClick={() => setPasswordOpen((v) => !v)}
          sx={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', mb: 1 }}>
          <Typography fontWeight={600}>修改密码</Typography>
          <ExpandMoreIcon
            sx={{
              transform: passwordOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: '0.2s',
            }}
          />
        </Box>

        <Collapse in={passwordOpen}>
          <TextField
            label="旧密码"
            type="password"
            size="small"
            fullWidth
            sx={{ mb: 1.5 }}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />

          <TextField
            label="新密码"
            type="password"
            size="small"
            fullWidth
            sx={{ mb: 2 }}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isPasswordValid) {
                savePassword();
              }
            }}
          />

          <Button
            fullWidth
            onClick={savePassword}
            disabled={!isPasswordValid}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              py: 1.2,
              background: isPasswordValid
                ? 'rgba(255,255,255,0.15)'
                : 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: isPasswordValid
                ? '1px solid rgba(255,255,255,0.25)'
                : '1px solid rgba(255,255,255,0.1)',
              color: isPasswordValid
                ? 'rgba(0,0,0,0.85)'
                : 'rgba(0,0,0,0.4)',
              boxShadow: isPasswordValid
                ? '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)'
                : 'none',
              transition: 'all 0.3s ease',
              '&:hover:not(:disabled)': {
                background: 'rgba(255,255,255,0.2)',
                borderColor: 'rgba(255,255,255,0.35)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
              },
              '&:disabled': {
                cursor: 'not-allowed',
              },
            }}>
            更新密码
          </Button>
        </Collapse>

        <Divider sx={{ opacity: 0.5, my: 2 }} />

        {/* —— 退出登录 —— */}
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            borderRadius: '999px',
            textTransform: 'none',
            py: 1,
            borderColor: 'rgba(255,0,0,0.3)',
            color: 'rgba(255,0,0,0.8)',
            '&:hover': {
              borderColor: 'rgba(255,0,0,0.5)',
              background: 'rgba(255,0,0,0.1)',
            },
          }}>
          退出登录
        </Button>
      </Box>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0 }
            to { opacity: 1 }
          }

          @keyframes modalPop {
            0% { opacity: 0; transform: scale(0.92) translate(-50%, -50%) }
            100% { opacity: 1; transform: scale(1) translate(-50%, -50%) }
          }

          @keyframes liquidMove {
            0%   { transform: rotate(0deg) translate(0, 0) }
            50%  { transform: rotate(180deg) translate(80px, 40px) }
            100% { transform: rotate(360deg) translate(0, 0) }
          }
        `}
      </style>
    </>
  );
}