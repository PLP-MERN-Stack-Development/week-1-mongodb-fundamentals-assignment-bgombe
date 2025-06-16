// find all books from a specific genre
db.books.aggregate([
  { $group: { _id: "$title", total_books: { $sum: "$fantasy" } } }
])

// find books published in the after a certain year

db.books.aggregate([
  {
    $group: {
      _id: "$title",
      total_books: {
        $sum: {
          $cond: [
            { $gte: ["$year", 1930] },
            1,
            0
          ]
        }
      }
    }
  }
])
// find books by a specific author
db.books.aggregate([
  {
    $lookup: {
      from: "books",
      localField: "author",
      foreignField: "author",
      as: "author_books"
    }
  },
  { $unwind: "$author_books" },
  { $match: { "author_books.author": "J.R.R. Tolkien" } },
  { 
    $group: { 
      _id: "$author_books.title", 
      total_books: { $sum: 1 },
      author: { $first: "$author_books.author" }
    } 
  },
  { 
    $project: { 
      _id: 0, 
      title: "$_id", 
      author: 1, 
      total_books: 1 
    } 
  }
])
// update the price 
db.books.updateOne(
  { title: "The Great Gutsby" },
  { $set: { price: 20.99 } }
)   

// delete a book by title
db.books.deleteOne(
  { title: "1984" }
)


// find books that are both in stock & published after 2010
db.books.aggregate([
  {
    $match: {
      in_stock: true,
      published_year: { $gt: 2010 }
    }
  },
  {
    $project: {
      title: 1
    }
  }
])
//  return  the books with only the title,author, and price 
db.books.aggregate([
    {$project:{
        title: 1,
        
    }}
])
//  sorting books by price in descending order
db.books.aggregate([
  {
    $sort: { price: -1 }
  },
  {
    $project: {
      title: 1,
      price: 1
    }
  }
])
//  sorting the books by price in ascending order
db.books.aggregate([
    {
        $sort: { price: 1 }
    },
    {
        $project: {
            title: 1,
            price: 1
        }
    }
])
// use limit and skip to implement pagination
db.books.aggregate([
    { $sort: { published_year: -1 } },
    { $skip: 5 }, // Skip the first 5 documents
    { $limit: 10 }, // Limit to the next 10 documents
    {
        $project: {
            title: 1,
        }
    }
])    

// create an aggregation pipeline to find the calculate the average price of books by genre
db.books.aggregate([
    {
        $group: {
            _id: "$genre",
            average_price: { $avg: "$price" }
        }
    },
    {
        $project: {
            _id: 0,
            genre: "$_id",
            average_price: 1
        }
    }
])


// create an aggregation pipeline to find the author with the most books in the collection
 db.books.aggregate([
    { 
        $group: {
            _id: "$author",
            total_books: { $sum: 1 }
        }
    },
    {
        $sort: { total_books: -1 } // Sort the total_books 
    },
    {
        $limit: 1 
    },
    {
        $project: {
            _id: 0,
            author: "$_id",
            total_books: 1
        }
    }
 ])
// use a pipeline that groups books by publication decade and counts them
db.books.aggregate([
    {
        $group: {
            _id: { $floor: { $divide: ["$published_year", 10] } },
            total_books: { $sum: 1 }
        }
    },
    {
        $project: {
            decade: { $multiply: ["$_id", 10] },
            total_books: 1,
            _id: 0
        }
    },
    {
        $sort: { decade: 1 } // Sort by decade in ascending order
    }
])

// Task five: create an index on the title for faster searches
db.books.createIndex({ title: 1 })

// create a compound index on author and published_year
db.books.createIndex({ author: 1, published_year: 1 })

// use the explain() method to analyze the performance of a query
db.books.find({ title: "The Hobbit" }).explain("executionStats")