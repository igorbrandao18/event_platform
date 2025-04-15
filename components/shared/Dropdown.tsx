import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ICategory } from "@/lib/database/models/category.model"
import { startTransition, useEffect, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "../ui/input"
import { createCategory, getAllCategories } from "@/lib/actions/category.actions"
import { useUser } from "@clerk/nextjs"

type DropdownProps = {
  value?: string
  onChangeHandler?: (value: string) => void
}

const Dropdown = ({ value, onChangeHandler }: DropdownProps) => {
  const [categories, setCategories] = useState<ICategory[]>([])
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');
  const { isSignedIn, user } = useUser();

  const handleAddCategory = async () => {
    if (!isSignedIn) {
      setError('You must be signed in to create a category');
      return;
    }

    try {
      const category = await createCategory({
        categoryName: newCategory.trim()
      });

      if (category) {
        setCategories((prevState) => [...prevState, category]);
        setNewCategory('');
        setError('');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create category');
    }
  }

  useEffect(() => {
    const getCategories = async () => {
      try {
        const categoryList = await getAllCategories();
        if (categoryList) {
          setCategories(categoryList as ICategory[]);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch categories');
      }
    }

    getCategories();
  }, [])

  return (
    <Select
      value={value}
      onValueChange={(value) => onChangeHandler?.(value)}
    >
      <SelectTrigger className="select-field">
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent>
        {categories.length > 0 && categories.map((category) => (
          <SelectItem key={category._id} value={category._id} className="select-item p-regular-14">
            {category.name}
          </SelectItem>
        ))}

        <AlertDialog>
          <AlertDialogTrigger className="p-medium-14 flex w-full rounded-sm py-3 pl-8 text-primary-500 hover:bg-primary-50 focus:text-primary-500">
            Add new category
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>New Category</AlertDialogTitle>
              <AlertDialogDescription>
                <Input 
                  type="text" 
                  placeholder="Category name" 
                  className="input-field mt-3" 
                  onChange={(e) => {
                    setNewCategory(e.target.value);
                    setError('');
                  }} 
                  value={newCategory}
                />
                {error && <p className="text-red-500 mt-2">{error}</p>}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setNewCategory('');
                setError('');
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                startTransition(() => {
                  handleAddCategory();
                });
              }}>
                Add
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SelectContent>
    </Select>
  )
}

export default Dropdown