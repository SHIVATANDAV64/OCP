import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Lock, Award, BookOpen, Settings, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storage, BUCKETS, authService, dbService, COLLECTIONS, Query, ID } from '@/lib/appwrite';
import { certificateService } from '@/services/certificateService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>('student');
  
  // Profile form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      loadUserData();
    }
  }, [user, authLoading, navigate]);

  const loadUserData = async () => {
    if (!user) return;
    try {
      setName(user.name);
      setEmail(user.email);
      
      // Load user role and avatar from database
      const userDoc = await dbService.listDocuments(COLLECTIONS.USERS, [Query.equal('userId', [user.$id])]);
      if (userDoc.documents.length > 0) {
        const userDocData = userDoc.documents[0] as Record<string, unknown>;
        const role = (userDocData.role as string) || 'student';
        const avatar = userDocData.avatar as string | undefined;
        setUserRole(role);
        if (avatar) {
          setAvatarPreview(avatar);
        }
      }
      
      // Load certificates
      const userCertificates = await certificateService.getUserCertificates(user.$id);
      setCertificates(userCertificates);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update name if changed
      if (name !== user?.name) {
        await authService.updateName(name);
      }

      // Upload avatar if selected
      if (avatarFile && user) {
        const fileResponse = await storage.createFile(BUCKETS.COURSE_THUMBNAILS, ID.unique(), avatarFile);
        const avatarUrl = storage.getFileDownload(BUCKETS.COURSE_THUMBNAILS, fileResponse.$id);
        const avatarUrlString = avatarUrl instanceof URL ? avatarUrl.toString() : (typeof avatarUrl === 'string' ? avatarUrl : avatarUrl.href);
        
        // Save avatar URL to user document in database
        const userDocs = await dbService.listDocuments(COLLECTIONS.USERS, [Query.equal('userId', [user.$id])]);
        if (userDocs.documents.length > 0) {
          await dbService.updateDocument(COLLECTIONS.USERS, userDocs.documents[0].$id, {
            avatar: avatarUrlString
          });
        }
        
        toast.success('Avatar uploaded successfully');
      }

      toast.success('Profile updated successfully');
      loadUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSaving(true);

    try {
      await authService.updatePassword(newPassword, currentPassword);
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password. Check your current password.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF9] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
            <div className="flex items-center gap-2">
              {userRole === 'admin' && (
                <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Admin
                </Badge>
              )}
              {userRole === 'instructor' && (
                <Badge className="bg-blue-100 text-blue-800">Instructor</Badge>
              )}
              {userRole === 'student' && (
                <Badge className="bg-green-100 text-green-800">Student</Badge>
              )}
            </div>
          </div>
          <p className="text-gray-600">Manage your account settings and view your achievements</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-[#F5F5F0]">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="certificates">
              <Award className="h-4 w-4 mr-2" />
              Certificates
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Profile Information</CardTitle>
                <CardDescription className="text-gray-600">
                  Update your personal information and profile picture
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Avatar Upload */}
                  <div>
                    <Label htmlFor="avatar">Profile Picture</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-10 w-10 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <Input
                          id="avatar"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('avatar')?.click()}
                        >
                          Upload Photo
                        </Button>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* User Role (readonly) */}
                  <div>
                    <Label htmlFor="role">Account Role</Label>
                    <div className="mt-1 p-3 bg-gray-50 border border-gray-300 rounded-md flex items-center justify-between">
                      <span className="text-gray-700 capitalize font-medium">{userRole}</span>
                      {userRole === 'admin' && (
                        <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Admin
                        </Badge>
                      )}
                      {userRole === 'instructor' && (
                        <Badge className="bg-blue-100 text-blue-800">Instructor</Badge>
                      )}
                      {userRole === 'student' && (
                        <Badge className="bg-green-100 text-green-800">Student</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Your account role cannot be changed directly. Contact support if needed.</p>
                  </div>

                  {/* Email (readonly) */}
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="mt-1 pl-10 bg-gray-50"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  {/* Bio */}
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <Button type="submit" disabled={saving} className="bg-gray-900 hover:bg-gray-800">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="mt-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">My Certificates</CardTitle>
                <CardDescription className="text-gray-600">
                  View and download your earned certificates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {certificates.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No certificates yet</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Complete courses to earn certificates
                    </p>
                    <Button onClick={() => navigate('/courses')} className="bg-gray-900 hover:bg-gray-800">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Browse Courses
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {certificates.map((cert) => (
                      <Card
                        key={cert.$id}
                        className="border-2 border-gray-200 hover:border-gray-400 transition-colors cursor-pointer"
                        onClick={() => navigate(`/certificate/${cert.$id}`)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <Award className="h-8 w-8 text-yellow-600" />
                            <Badge variant="secondary">{cert.certificateNumber}</Badge>
                          </div>
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">
                            {cert.courseName}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Completed on {new Date(cert.completedAt).toLocaleDateString()}
                          </p>
                          <Button variant="outline" size="sm" className="w-full">
                            View Certificate
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Change Password</CardTitle>
                <CardDescription className="text-gray-600">
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
                  </div>

                  <div>
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  <Button type="submit" disabled={saving} className="bg-gray-900 hover:bg-gray-800">
                    {saving ? 'Updating...' : 'Change Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Account Settings</CardTitle>
                <CardDescription className="text-gray-600">
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b">
                  <div>
                    <h3 className="font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive email updates about your courses</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>

                <div className="flex items-center justify-between py-4 border-b">
                  <div>
                    <h3 className="font-medium text-gray-900">Course Reminders</h3>
                    <p className="text-sm text-gray-600">Get reminded to continue your learning</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>

                <div className="flex items-center justify-between py-4 border-b">
                  <div>
                    <h3 className="font-medium text-gray-900">Marketing Emails</h3>
                    <p className="text-sm text-gray-600">Receive updates about new courses</p>
                  </div>
                  <Button variant="outline" size="sm">Disable</Button>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="font-medium text-red-600 mb-2">Danger Zone</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
