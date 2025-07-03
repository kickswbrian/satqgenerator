
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  HardDrive, 
  Download, 
  Upload, 
  Trash2, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Cloud
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getStorageInfo,
  getStorageSettings,
  saveStorageSettings,
  exportAllData,
  importData,
  cleanupOldData,
  clearAllData
} from '@/utils/storage';

const StorageManager = () => {
  const [storageInfo, setStorageInfo] = useState(getStorageInfo());
  const [settings, setSettings] = useState(getStorageSettings());
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      setStorageInfo(getStorageInfo());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveStorageSettings(newSettings);
    
    toast({
      title: "Settings Updated",
      description: "Storage settings have been saved.",
    });
  };

  const handleExport = () => {
    const success = exportAllData();
    if (success) {
      toast({
        title: "Data Exported!",
        description: "Your training data has been downloaded as a backup file.",
      });
    } else {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const result = await importData(file);
      
      toast({
        title: result.success ? "Import Successful!" : "Import Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });

      if (result.success) {
        setStorageInfo(getStorageInfo());
        window.location.reload(); // Refresh to show imported data
      }
    } finally {
      setIsImporting(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleCleanup = () => {
    const deletedCount = cleanupOldData(30);
    setStorageInfo(getStorageInfo());
    
    toast({
      title: "Cleanup Complete",
      description: `Removed ${deletedCount} old questions from storage.`,
    });
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      clearAllData();
      setStorageInfo(getStorageInfo());
      
      toast({
        title: "All Data Cleared",
        description: "All questions and training data have been removed.",
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Storage Status */}
      <Card className={storageInfo.isNearLimit ? "border-orange-200 bg-orange-50" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Status
            {storageInfo.isNearLimit && (
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Near Limit
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Local Storage Usage</span>
              <span>{storageInfo.percentage.toFixed(1)}%</span>
            </div>
            <Progress 
              value={storageInfo.percentage} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatBytes(storageInfo.used)} used</span>
              <span>{formatBytes(storageInfo.available)} total</span>
            </div>
          </div>

          {storageInfo.isNearLimit && (
            <div className="p-3 bg-orange-100 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 text-orange-800 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-semibold">Storage Almost Full</span>
              </div>
              <p className="text-sm text-orange-700 mb-3">
                Your browser storage is getting full. Consider exporting your data or enabling auto-cleanup.
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleExport} variant="outline">
                  Export Data
                </Button>
                <Button size="sm" onClick={handleCleanup} variant="outline">
                  Cleanup Old Data
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export/Import */}
          <div>
            <h4 className="font-semibold mb-3">Backup & Restore</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button onClick={handleExport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
              
              <div className="relative">
                <Button 
                  className="w-full" 
                  variant="outline"
                  disabled={isImporting}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isImporting ? 'Importing...' : 'Import Data'}
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isImporting}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Storage Settings */}
          <div>
            <h4 className="font-semibold mb-3">Storage Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-cleanup">Auto Cleanup</Label>
                  <p className="text-sm text-gray-500">
                    Automatically remove questions older than 30 days
                  </p>
                </div>
                <Switch
                  id="auto-cleanup"
                  checked={settings.autoCleanup}
                  onCheckedChange={(checked) => handleSettingChange('autoCleanup', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compression">Enable Compression</Label>
                  <p className="text-sm text-gray-500">
                    Reduce storage space usage
                  </p>
                </div>
                <Switch
                  id="compression"
                  checked={settings.compressionEnabled}
                  onCheckedChange={(checked) => handleSettingChange('compressionEnabled', checked)}
                />
              </div>

              <div>
                <Label htmlFor="max-questions">Maximum Questions to Store</Label>
                <Input
                  id="max-questions"
                  type="number"
                  value={settings.maxQuestions}
                  onChange={(e) => handleSettingChange('maxQuestions', parseInt(e.target.value) || 1000)}
                  className="mt-1"
                  min="100"
                  max="10000"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Older questions will be automatically removed when this limit is reached
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dangerous Actions */}
          <div>
            <h4 className="font-semibold mb-3 text-red-600">Danger Zone</h4>
            <div className="space-y-3">
              <Button onClick={handleCleanup} variant="outline" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Clean Up Old Data (30+ days)
              </Button>
              
              <Button onClick={handleClearAll} variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cloud Storage Preparation */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-600" />
            Cloud Storage (Coming Soon)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-700 mb-3">
            Upgrade to cloud storage for unlimited capacity, cross-device sync, and automatic backups.
          </p>
          <Button variant="outline" disabled className="w-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            Enable Cloud Storage
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorageManager;
