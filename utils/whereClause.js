/*
{
  search: 'coder',
  page: '2',
  category: 'shortsleeves',
  rating: { gte: '4' },
  price: { lte: '999', gte: '199' }
}
*/
class WhereClause {
    constructor(base, bigQ) {
        this.base = base
        this.bigQ = bigQ
    }
    searchProduct() {
        if (this.bigQ.search) {
            const name = this.bigQ.search
            this.base = this.base.find({
                name: { $regex: name, $options: "gi" },
            })
        }
        return this
    }
    filter() {
        if (this.bigQ !== {}) {
            let copyQ = { ...this.bigQ }
            delete copyQ["search"]
            delete copyQ["page"]
            copyQ = JSON.parse(
                JSON.stringify(copyQ).replace(/\b(gte|lte)\b/g, (m) => `$${m}`)
            )
            this.base = this.base.find(copyQ)
        }
        return this
    }
    pager(resultperPage) {
        let currentPage = 1
        if (this.bigQ.page) {
            currentPage = this.bigQ.page
        }
        this.base = this.base
            .limit(resultperPage)
            .skip(resultperPage * (currentPage - 1))
        return this
    }
}
module.exports = WhereClause
