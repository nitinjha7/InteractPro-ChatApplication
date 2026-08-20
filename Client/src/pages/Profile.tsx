import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Camera, Loader2, LogOut, UserCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { trpc } from '@/lib/trpc';
import { useStore } from '@/store/store';

const Profile = () => {
  const navigate = useNavigate();
  const userInfo = useStore((s) => s.userInfo);
  const setUserInfo = useStore((s) => s.setUserInfo);
  const clearUserInfo = useStore((s) => s.clearUserInfo);

  const [firstName, setFirstName] = useState(userInfo?.firstName ?? '');
  const [lastName, setLastName] = useState(userInfo?.lastName ?? '');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadingImage(true);
    try {
      const body = new FormData();
      body.append('profile-image', file);
      const res = await fetch(`${import.meta.env.VITE_APP_SERVER_URL}/api/upload-image`, {
        method: 'POST',
        credentials: 'include',
        body,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setUserInfo({ ...userInfo, image: data.image } as never);
      toast.success('Profile picture updated');
    } catch {
      toast.error('Could not upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: (data) => {
      setUserInfo(data.user as never);
      toast.success('Profile saved');
      navigate('/chat');
    },
    onError: (e) => toast.error(e.message),
  });

  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      clearUserInfo();
      navigate('/auth');
    },
  });

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    updateProfile.mutate({ firstName, lastName });
  };

  return (
    <div className="h-full w-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Your profile</h1>
          <Button variant="ghost" size="sm" onClick={() => logout.mutate()}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        <div className="mb-6 flex justify-center">
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={uploadingImage}
            className="group relative rounded-full"
          >
            <Avatar className="h-20 w-20 ring-2 ring-primary/30">
              {userInfo?.image ? (
                <AvatarImage src={userInfo.image} alt="Profile" className="object-cover" />
              ) : (
                <UserCircle2 className="text-muted-foreground" />
              )}
            </Avatar>
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70 opacity-0 transition-opacity group-hover:opacity-100">
              {uploadingImage ? (
                <Loader2 className="h-5 w-5 animate-spin text-foreground" />
              ) : (
                <Camera className="h-5 w-5 text-foreground" />
              )}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input value={userInfo?.email ?? ''} disabled className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">First name</label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Last name</label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>

          <Button onClick={handleSave} disabled={updateProfile.isPending} className="w-full">
            {updateProfile.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </span>
            ) : (
              'Save & Continue'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
