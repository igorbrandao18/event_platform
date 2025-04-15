"use server"

import { CreateCategoryParams } from "@/types"
import { handleError } from "../utils"
import { connectToDatabase } from "../database"
import Category from "../database/models/category.model"
import { auth } from "@clerk/nextjs"

export const createCategory = async ({ categoryName }: CreateCategoryParams) => {
  try {
    const { userId } = auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    await connectToDatabase();

    const newCategory = await Category.create({ name: categoryName });

    return JSON.parse(JSON.stringify(newCategory));
  } catch (error) {
    handleError(error)
  }
}

export const getAllCategories = async () => {
  try {
    await connectToDatabase();

    const categories = await Category.find();

    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    handleError(error)
  }
}