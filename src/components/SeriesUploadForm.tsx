
import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '../hooks/use-toast';
import { Upload, Film } from 'lucide-react';

const seriesFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  genre: z.string().min(1, 'Genre is required'),
  releaseYear: z.number().min(1900).max(new Date().getFullYear() + 5),
  episodes: z.number().min(1, 'Must have at least 1 episode'),
  status: z.enum(['Ongoing', 'Completed', 'Cancelled']),
  poster: z.string().url('Must be a valid URL'),
  videoUrl: z.string().url('Must be a valid URL'),
  rating: z.number().min(0).max(10),
  language: z.string().min(1, 'Language is required'),
  isTrending: z.boolean(),
  isFeatured: z.boolean(),
});

type SeriesFormData = z.infer<typeof seriesFormSchema>;

export const SeriesUploadForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SeriesFormData>({
    resolver: zodResolver(seriesFormSchema),
    defaultValues: {
      title: '',
      description: '',
      genre: '',
      releaseYear: new Date().getFullYear(),
      episodes: 1,
      status: 'Ongoing',
      poster: '',
      videoUrl: '',
      rating: 0,
      language: 'English',
      isTrending: false,
      isFeatured: false,
    },
  });

  const onSubmit = async (data: SeriesFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting series data:', data);

      const seriesData = {
        ...data,
        views: 0,
        uploadedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('Adding series to Firebase...');
      const docRef = await addDoc(collection(db, 'series'), seriesData);
      console.log('Series uploaded successfully with ID:', docRef.id);

      toast({
        title: "Success!",
        description: `Series "${data.title}" uploaded successfully!`,
      });

      // Reset form
      form.reset();
    } catch (error) {
      console.error('Error uploading series:', error);
      toast({
        title: "Error",
        description: "Failed to upload series. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Film className="w-6 h-6 text-red-600" />
          Upload New Series
        </CardTitle>
        <CardDescription className="text-gray-400">
          Add a new TV series to your collection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Series Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter series title"
                        className="bg-gray-800 border-gray-600 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Genre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Drama, Comedy, Thriller"
                        className="bg-gray-800 border-gray-600 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter series description"
                      className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="releaseYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Release Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2024"
                        className="bg-gray-800 border-gray-600 text-white"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="episodes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Total Episodes</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="12"
                        className="bg-gray-800 border-gray-600 text-white"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Rating (0-10)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        placeholder="8.5"
                        className="bg-gray-800 border-gray-600 text-white"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="Ongoing" className="text-white hover:bg-gray-700">Ongoing</SelectItem>
                        <SelectItem value="Completed" className="text-white hover:bg-gray-700">Completed</SelectItem>
                        <SelectItem value="Cancelled" className="text-white hover:bg-gray-700">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Language</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., English, Spanish"
                        className="bg-gray-800 border-gray-600 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="poster"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Poster URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/poster.jpg"
                      className="bg-gray-800 border-gray-600 text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-gray-400">
                    URL to the series poster image
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Trailer/Video URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/video.mp4"
                      className="bg-gray-800 border-gray-600 text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-gray-400">
                    URL to the series trailer or preview video
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-6">
              <FormField
                control={form.control}
                name="isTrending"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4 accent-red-600"
                      />
                    </FormControl>
                    <FormLabel className="text-white cursor-pointer">
                      Mark as Trending
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4 accent-red-600"
                      />
                    </FormControl>
                    <FormLabel className="text-white cursor-pointer">
                      Mark as Featured
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Uploading Series...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Series
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
